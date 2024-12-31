var express = require('express');
const multer  = require('multer');
var path = require('path');

const AuthController = require("../controllers/AuthController");
const GoogleOauthController = require("../controllers/GoogleOauthController");

// Middleware Imports
const isAuthenticatedMiddleware = require("../middlewares/IsAuthenticatedMiddleware");
const SchemaValidationMiddleware = require("../middlewares/SchemaValidationMiddleware");

// JSON Schema Imports for payload verification
const registerPayload = require("../schemas/registerPayload");
const loginPayload = require("../schemas/loginPayload");

var router = express.Router();

// + https://www.npmjs.com/package/multer#diskstorage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, '/tmp/my-uploads')

    // + https://codedamn.com/news/nodejs/how-to-get-current-directory-in-node-js
    // + https://www.w3schools.com/nodejs/met_path_join.asp
    const folder = path.join(process.cwd(), 'public', 'images');
    cb(null, folder)
  },
  // filename: function (req, file, cb) {
  //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  //   cb(null, file.fieldname + '-' + uniqueSuffix)
  // }
})

const upload = multer({ storage: storage })

router.post(
  "/auth/signup",
  [
    upload.none(),
    SchemaValidationMiddleware.verify(registerPayload)
  ],
  AuthController.register
);

router.post(
  "/auth/login",
  [
    upload.none(),
    SchemaValidationMiddleware.verify(loginPayload)
  ],
  AuthController.login
);

router.get('/auth/me',
  [
    isAuthenticatedMiddleware.check,
  ],
  AuthController.getUser
);

router.patch('/auth/me',
  [
    isAuthenticatedMiddleware.check,
    upload.single('profile_picture')
  ],
  AuthController.updateUser
);

router.get('/oauth/google/init',
  GoogleOauthController.init
);

// router.get('/oauth/google/continue',
//   GoogleOauthController.continue
// );
router.post('/oauth/google/continue',
  GoogleOauthController.continue
);

module.exports = router;
