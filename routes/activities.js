const router = require("express").Router();
const multer  = require('multer');

// Controller Imports
const ActivityController = require("../controllers/ActivityController");

// Middleware Imports
const isAuthenticatedMiddleware = require("../middlewares/IsAuthenticatedMiddleware");
const SchemaValidationMiddleware = require("../middlewares/SchemaValidationMiddleware");
const IdUUIDMiddleware = require("../middlewares/IdUUIDMiddleware");

// JSON Schema Imports for payload verification
const activityCreatePayload = require("../schemas/activityCreatePayload");
const activityUpdatePayload = require("../schemas/activityUpdatePayload");

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

router.get(
  "/",
  [
    isAuthenticatedMiddleware.check,
  ],
  ActivityController.getAllActivities
);

router.get(
  "/:activity_id",
  [
    IdUUIDMiddleware.check,
    isAuthenticatedMiddleware.check,
  ],
  ActivityController.getActivityById
);

router.post(
  "/",
  [
    isAuthenticatedMiddleware.check,
    upload.none(),
    SchemaValidationMiddleware.verify(activityCreatePayload)
  ],
  ActivityController.createActivity
);

router.patch(
  "/:activity_id",
  [
    IdUUIDMiddleware.check,
    isAuthenticatedMiddleware.check,
    upload.none(),
    SchemaValidationMiddleware.verify(activityUpdatePayload)
  ],
  ActivityController.updateActivity
);

router.delete(
  "/:activity_id",
  [
    IdUUIDMiddleware.check,
    isAuthenticatedMiddleware.check,
  ],
  ActivityController.deleteActivity
);

module.exports = router;
