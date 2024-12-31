const {OAuth2Client} = require('google-auth-library');
const {google} = require('googleapis');

var db = require('../db');
const FederatedCredentialModel = require("../db/models/FederatedCredential");
const UserModel = require("../db/models/User");
const { generateAccessToken } = require("../utilities/encryption");
const { uploadImage } = require("../utilities/uploadImage");
const { populateUserAndActivity } = require("../utilities/populate_dummy_data");

// <<<<<<<<<<>>>>>>>>>
// + https://developers.google.com/identity/sign-in/web/backend-auth#using-a-google-api-client-library
// + https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
const client = new OAuth2Client();

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env['GOOGLE_CLIENT_ID'],  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If the request specified a Google Workspace domain:
  // const domain = payload['hd'];

  // SAMPLE PAYLOAD
  // {
  //   iss: 'https://accounts.google.com',
  //   azp: '73323644785-9hmosrpadbm6cn5cjkb9dm750vi9do4v.apps.googleusercontent.com',
  //   aud: '73323644785-9hmosrpadbm6cn5cjkb9dm750vi9do4v.apps.googleusercontent.com',
  //   sub: '117182758292447858368',
  //   email: 'ingeniousdevke@gmail.com',
  //   email_verified: true,
  //   nbf: 1735467051,
  //   name: 'ingenious developers',
  //   picture: 'https://lh3.googleusercontent.com/a/ACg8ocLnx_KiL1J-qHUKFGwc45ZzMv9KvhsAHgpS2zwuWcggA9heMBk=s96-c',
  //   given_name: 'ingenious',
  //   family_name: 'developers',
  //   iat: 1735467351,
  //   exp: 1735470951,
  //   jti: '21fbbd30e30efe36d67870f1c30619fad4e4c92d'
  // }
  return payload
}
// <<<<<<<<<<>>>>>>>>>

function getToken (req) {
  const { query, body } = req;

  return new Promise(function(resolve, reject) {
    if(body.id_token) {
      resolve(body.id_token);
    } else {
      const code = body.code ?? query.code
      // const redirect_uri = body.redirect_uri ?? query.redirect_uri
      if(code) {
        // ! NOTICE OF NO SUPPORT
        reject("request_type=code not currently supported. Provide id_token instead");

        // + https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file#generating-an-authentication-url
        const oauth2Client = new google.auth.OAuth2(
          process.env['GOOGLE_CLIENT_ID'],
          process.env['GOOGLE_CLIENT_SECRET'],
          process.env['GOOGLE_REDIRECT_URL'],
        );

        // generate a url that asks permissions for Blogger and Google Calendar scopes
        const scopes = [
          // 'https://www.googleapis.com/auth/blogger',
          // 'https://www.googleapis.com/auth/calendar',
          // <<<<<<<<>>>>>>
          // + https://developers.google.com/identity/protocols/oauth2/scopes#oauth2
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          // <<<<<<<<>>>>>>
        ];

        const url = oauth2Client.generateAuthUrl({
          // 'online' (default) or 'offline' (gets refresh_token)
          // access_type: 'offline',
        
          // If you only need one scope, you can pass it as a string
          scope: scopes
        });

        // + https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file#retrieve-access-token
        // This will provide an object with the access_token and refresh_token.
        // Save these somewhere safe so they can be used at a later time.
        oauth2Client.getToken(code)
          .then(function (value) {
            const {tokens} = value;
            // oauth2Client.setCredentials(tokens);

            resolve(tokens.access_token);
          })
          .catch((err) => {
            // <<<<<<<<<<>>>>>>>>
            // "invalid_grant" seems to be generic error message
            // "... In the OAuth2 spec, "invalid_grant" is sort of a catch-all for all errors
            // related to invalid/expired/revoked tokens (auth grant or refresh token)."
            // See https://stackoverflow.com/questions/10576386/invalid-grant-trying-to-get-oauth-token-from-google/38433986#38433986
            // In my case I was probably debugging with a 'code' whose 'access_token' was probably expired
            // since I was using for a long time
            // <<<<<<<<<<>>>>>>>>

            reject(err);
          });
      } else {
        throw 'Missing param: id_token or code'
      }
    }
    
  });
}

module.exports = {
  init: (req, res) => {
    // Use this link to debug wether 'req.query.redirect_uri' is being set
    // + http://localhost:3000/oauth/google/init?redirect_uri=https://joseph.co.ke
    // res.send(req.query.redirect_uri) // For development only

    const redirect_uri = req.query.redirect_uri

    // + https://github.com/googleapis/google-api-nodejs-client?tab=readme-ov-file#generating-an-authentication-url
    const oauth2Client = new google.auth.OAuth2(
      process.env['GOOGLE_CLIENT_ID'],
      process.env['GOOGLE_CLIENT_SECRET'],
      redirect_uri,
    );

    // generate a url that asks permissions for Blogger and Google Calendar scopes
    const scopes = [
      // 'https://www.googleapis.com/auth/blogger',
      // 'https://www.googleapis.com/auth/calendar',
      // <<<<<<<<>>>>>>
      // + https://developers.google.com/identity/protocols/oauth2/scopes#oauth2
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      // <<<<<<<<>>>>>>
    ];

    const url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      // access_type: 'offline',
    
      // If you only need one scope, you can pass it as a string
      scope: scopes
    });

    return res.status(200).json({
      authUrl: url,
    });
  },
  
  continue: (req, res) => {
    const { query, body } = req;
    
    getToken(req)
      .then(function (token) {

        verify(token)
          .then((payload) => {

            const provider = payload['iss']
            const subject = payload['sub']
            const filters = {
              provider: provider,
              subject: subject,
            }
            FederatedCredentialModel.findFederatedCredential(filters)
              .then(async (credential) => {
                if(!credential) {
                  // ! TO BE DONE - handle an existing "regular" account with that email

                  const fileURL = await uploadImage(payload.picture, "images");

                  // Creat user -> Create Federated credential -> Generate Token
                  const user_data = {
                    'email': payload.email,
                    'password': null,
                    'name': payload.name,
                    'profile_picture': fileURL,
                    'bio': "",
                    'display_empty_spaces': true,
                  }
                  UserModel.createUser(user_data)
                    .then((user) => {
                      
                      const credential_data = {
                        'user_id': user.id,
                        'provider': provider,
                        'subject': subject,
                      }
                      FederatedCredentialModel.createFederatedCredential(credential_data)
                        .then((created_credential) => {

                          // Generating an AccessToken for the user, which will be
                          // required in every subsequent request.
                          const accessToken = generateAccessToken(user.email, user.id);

                          if(process.env.IS_DEMO == 'true') {
                            populateUserAndActivity(accessToken)
                          }

                          return  res.status(200).json({
                            token: accessToken,
                          });

                        })
                        .catch((err) => {
                          return res.status(500).json({
                            code: "ERROR_CODE_SERVER_ERROR",
                            message: `ERROR CREATING CREDENTIAL: ${err}`,
                          });
                        });

                    })
                    .catch((err) => {
                      return res.status(500).json({
                        code: "ERROR_CODE_SERVER_ERROR",
                        message: `ERROR CREATING USER: ${err}`,
                      });
                    });

                } else {
                  
                  UserModel.findUser({ id: credential.user_id })
                    .then((user) => {
                      
                      if(user) {
                        // Generating an AccessToken for the user, which will be
                        // required in every subsequent request.
                        const accessToken = generateAccessToken(user.email, user.id);

                        return res.status(200).json({
                          token: accessToken,
                        });
                      } else {
                        // For this to occur the 'user' record must have been deleted
                        // but its associated 'federated_crential' record was not (e.g during debug/test)
                        // This can be mitigation by defining relationships between the models and
                        // setting the on delete to cascade instead of deleting it manualy as seen here
                        FederatedCredentialModel.deleteFederatedCredential({ id: credential.id})
                          .then((numberOfEntriesDeleted) => {

                            return res.status(403).json({
                              code: "ERROR_CODE_ACCESS_DENIED",
                              message: `User credentials missing a user account, please create the account again`,
                            });
                            
                          })
                          .catch((err) => {
                            return res.status(500).json({
                              status: false,
                              error: err,
                            });
                          });

                      }
                      

                    })
                    .catch((err) => {
                      return res.status(500).json({
                        code: "ERROR_CODE_SERVER_ERROR",
                        message: `ERROR FINDING USER: ${err}`,
                      });
                    });
                }

              })
              .catch((err) => {
                return res.status(500).json({
                  code: "ERROR_CODE_SERVER_ERROR",
                  message: `ERROR FINDING CREDENTIAL: ${err}`,
                });
              });

          })
          .catch((err) => {
            return res.status(500).json({
              code: "ERROR_CODE_SERVER_ERROR",
              message: `ERROR VERIFYING CODE: ${err}`,
            });
          });

      })
      .catch((err) => {
        return res.status(500).json({
          code: "ERROR_CODE_INPUT_ERROR",
          message: `ERROR GETTING TOKEN: ${err}`,
        });
      });
    

  },

};
