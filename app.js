require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var SQLiteStore = require('connect-sqlite3')(session);
const cors = require("cors");

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');

var app = express();

app.locals.pluralize = require('pluralize');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
app.use(passport.authenticate('session'));
app.use(cors());

// <<<<<<<<<>>>>>>>>>
const { port } = require("./config");
const PORT = port;

const ActivityRoutes = require("./routes/activities");

var sequelize = require('./db');

// Syncing the models that are defined on sequelize with the tables that alredy exists
// in the database. It creates models as tables that do not exist in the DB.
sequelize
  .sync()
  .then(() => {
    console.log("Sequelize Initialised!!");

    // Attaching the Authentication and User Routes to the app.
    app.use('/', indexRouter);
    app.use('/', authRouter);
    app.use("/activity", ActivityRoutes);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    app.listen(PORT, () => {
      console.log("Server Listening on PORT:", port);

      if(process.env.IS_DEMO == 'true') {
        console.log("Server running on DEMO mode");
      }
    });
  })
  .catch((err) => {
    console.error("Sequelize Initialisation threw an error:", err);
  });
// <<<<<<<<<>>>>>>>>>

module.exports = app;
