const UserModel = require("../db/models/User");
const { generateAccessToken, encryptPassword } = require("../utilities/encryption");
const { uploadImage } = require("../utilities/uploadImage");
const { populateUserAndActivity } = require("../utilities/populate_dummy_data");

function userReadSerializer(item) {
  return {
    id: item.id,
    created_at: new Date(item.created_at).getTime() / 1000,
    email: item.email,
    name: item.name,
    bio: item.bio,
    display_empty_spaces: item.display_empty_spaces,
    profile_picture:  item.profile_picture
    ? {
      url: item.profile_picture
    }
    : null
  }
}

async function userWriteSerializer(req) {
  const {
    body: payload,
  } = req;

  const data = {
    email: payload.email,
    name: payload.name,
    bio: payload.bio,
    display_empty_spaces: payload.display_empty_spaces,
  }

  if(payload.password) {
    let encryptedPassword = encryptPassword(payload.password);
    data["password"] = encryptedPassword;
  }

  // + https://medium.com/@mudassirabbas.ma/upload-and-display-image-with-other-form-data-in-nodejs-and-reactjs-a398f7fc511b
  if (req.file) {
    const image = req.file ? req.file.path : null;
    const image_path = image.replaceAll("\\\\", "/").replaceAll("\\", "/");
    const working_dir = process.cwd().replaceAll("\\\\", "/").replaceAll("\\", "/");
    var fileURL = image_path.replace(working_dir, "");
    fileURL = fileURL.replace("/public", "")
    
    data["profile_picture"] = fileURL;
  } else if(req.body.profile_picture) {

    const fileURL = await uploadImage(req.body.profile_picture, "images");
    data["profile_picture"] = fileURL;

  }

  return data
}

module.exports = {

  getUser: (req, res) => {
    const userId = req.user.id;

    UserModel.findUser({ id: userId })
      .then((user) => {
        // return res.status(200).json(user.toJSON());

        const data = userReadSerializer(user)
        return res.status(200).json(data);
      })
      .catch((err) => {
        return res.status(500).json({
          code: "ERROR_CODE_SERVER_ERROR",
          message: err.message,
        });
      });
  },

  updateUser: (req, res) => {
    const userId = req.user.id;

    const {
      body: payload,
    } = req;

    // IF the payload does not have any keys,
    // THEN we can return an error, as nothing can be updated
    if (!Object.keys(payload).length) {
      return res.status(400).json({
        code: 'ERROR_CODE_INPUT_ERROR',
        message: "Body is empty, hence can not update the user.",
      });
    }

    if(payload.action == "welcome") {
      UserModel.findUser({ id: userId })
        .then((user) => {
          // return res.status(200).json(user.toJSON());

          fetch('https://send.api.mailtrap.io/api/send', {
            method: 'POST',
            body: JSON.stringify({
              "from":{
                "email":"ncr@joseph.co.ke",
                "name":"Remana Team"
              },
              "to":[
                {
                  "email": user.email
                }
              ],
              "template_uuid":"7bb38124-dac7-4e9a-8462-50313ccefade",
              "template_variables":{
                "company_info_name":"NCR Kenya",
                "name": user.name,
                "company_info_address":"Nairobi",
                "company_info_city":"Nairobi",
                "company_info_zip_code":"00100",
                "company_info_country":"Kenya"
              }
            }),
            headers: {
              "Authorization": `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
              "Content-Type": "application/json",
            },
          })
            .then(function(resp) {
              // When POST succeeded
              // const data = userReadSerializer(user)
              return res.status(200).json(resp);
            });
          
        })
        .catch((err) => {
          return res.status(500).json({
            code: "ERROR_CODE_SERVER_ERROR",
            message: err.message,
          });
        });
    } else {
      userWriteSerializer(req)
        .then(function(data) {
          UserModel.updateUser({ id: userId }, data)
            .then(() => {
              return UserModel.findUser({ id: userId });
            })
            .then(async (user) => {
              // return res.status(200).json(user.toJSON());

              const data = userReadSerializer(user);
              return res.status(200).json(data);
            })
            .catch((err) => {
              return res.status(500).json({
                code: "ERROR_CODE_SERVER_ERROR",
                message: err.message,
              });
            });
        })

      
    }

  },

  register: (req, res) => {
    const payload = req.body;
    const { email, password } = req.body;

    // <<<<<<<<>>>>>>
    // Handled with 'SchemaValidationMiddleware'
    // if(!email) {
    //   return res.status(400).json({
    //       code: "ERROR_CODE_INPUT_ERROR",
    //       message: "Missing param: email",
    //       payload: {
    //         param: "email"
    //       }
    //     });
    // }

    // if(!password) {
    //   return res.status(400).json({
    //       code: "ERROR_CODE_INPUT_ERROR",
    //       message: "Missing param: password",
    //       payload: {
    //         param: "password"
    //       }
    //     });
    // }
    // <<<<<<<<>>>>>>

    UserModel.findUser({ email })
      .then((user) => {
        // IF user is not found with the given email
        // THEN Return user not found error
        if (!user) {
          let encryptedPassword = encryptPassword(payload.password);

          UserModel.createUser(
            Object.assign(payload, {
              password: encryptedPassword,

              name: payload.name ?? "",
              profile_picture: "",
              bio: "",
              display_empty_spaces: true,
            })
          )
            .then(async (created_user) => {
              // Generating an AccessToken for the user, which will be
              // required in every subsequent request.
              const accessToken = generateAccessToken(payload.email, created_user.id);

              if(process.env.IS_DEMO == 'true') {
                populateUserAndActivity(accessToken)
              }

              return res.status(200).json({
                authToken: accessToken,
              });

            })
            .catch((err) => {
              return res.status(500).json({
                code: "ERROR_CODE_SERVER_ERROR",
                message: err.message,
              });
            });

        } else {
          return res.status(403).send({
            code: "ERROR_CODE_ACCESS_DENIED",
            message: 'This account is already in use.'
          });
        }

      })
      .catch((err) => {
        return res.status(500).json({
          code: "ERROR_CODE_SERVER_ERROR",
          message: err.message,
        });
      });

  },

  login: (req, res) => {
    const { email, password } = req.body;

    // <<<<<<<<>>>>>>
    // Handled with 'SchemaValidationMiddleware'
    // if(!email) {
    //   return res.status(400).json({
    //       code: "ERROR_CODE_INPUT_ERROR",
    //       message: "Missing param: email",
    //       payload: {
    //         param: "email"
    //       }
    //     });
    // }

    // if(!password) {
    //   return res.status(400).json({
    //       code: "ERROR_CODE_INPUT_ERROR",
    //       message: "Missing param: password",
    //       payload: {
    //         param: "password"
    //       }
    //     });
    // }
    // <<<<<<<<>>>>>>

    UserModel.findUser({ email })
      .then((user) => {
        // IF user is not found with the given email
        // THEN Return user not found error
        if (!user) {
          return res.status(400).json({
            code: 'ERROR_CODE_INPUT_ERROR',
            message: `Could not find any user with email: \`${email}\`.`,
          });
        }

        const encryptedPassword = encryptPassword(password);

        // IF Provided password does not match with the one stored in the DB
        // THEN Return password mismatch error
        if (user.password !== encryptedPassword) {
          return res.status(400).json({
            code: 'ERROR_CODE_INPUT_ERROR',
            message: `Provided email and password did not match.`,
          });
        }

        // Generating an AccessToken for the user, which will be
        // required in every subsequent request.
        const accessToken = generateAccessToken(user.email, user.id);

        return res.status(200).json({
          authToken: accessToken,
        });

      })
      .catch((err) => {
        return res.status(500).json({
          code: "ERROR_CODE_SERVER_ERROR",
          message: err.message,
        });
      });
  },

};
