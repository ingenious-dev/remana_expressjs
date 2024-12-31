var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');
var db = require('../db');
const {OAuth2Client} = require('google-auth-library');

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  // callbackURL: '/oauth2/redirect/google',
  callbackURL: '/oauth/google/continue',
  scope: [ 'profile' ]
}, function verify(issuer, profile, cb) {
  db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
    issuer,
    profile.id
  ], function(err, row) {
    if (err) { return cb(err); }
    if (!row) {
      db.run('INSERT INTO users (name) VALUES (?)', [
        profile.displayName
      ], function(err) {
        if (err) { return cb(err); }
        
        var id = this.lastID;
        db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
          id,
          issuer,
          profile.id
        ], function(err) {
          if (err) { return cb(err); }
          var user = {
            id: id,
            name: profile.displayName
          };
          return cb(null, user);
        });
      });
    } else {
      db.get('SELECT * FROM users WHERE id = ?', [ row.user_id ], function(err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false); }
        return cb(null, row);
      });
    }
  });
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

module.exports = {
  init: (req, res) => {
    // Use this link to debug wether 'req.query.redirect_uri' is being set
    // + http://localhost:3000/oauth/google/init?redirect_uri=https://joseph.co.ke
    // res.send(req.query.redirect_uri) // For development only

    req.session.redirect_uri = req.query.redirect_uri

    passport.authenticate('google')(req, res)
  },

  continue: (req, res) => {
    // passport.authenticate('google', {
    //   successRedirect: req.session.redirect_uri ?? "/",
    //   failureRedirect: '/login'
    // })(req, res)
    passport.authenticate('google', function(err, user, info, status) {
      if (err) { return next(err) }
      if (!user) { return res.redirect('/auth/login') }
      return res.status(200).json({
        authToken: accessToken,
      });
    })(req, res, next);
  },

};
