// load env stuff first since db and jwt need it
require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const handlebars = require('hbs');
const passport = require('passport');

// app routes
const indexRouter = require('./app_server/routes/index');
const usersRouter = require('./app_server/routes/users');
const travelRouter = require('./app_server/routes/travel');
const apiRouter = require('./app_api/routes/index');

// start database and passport config
require('./app_api/models/db');
require('./app_api/config/passport');

const app = express();

// only allow the angular app or origins listed in the env file
const allowedOrigins = (process.env.CLIENT_ORIGINS ||
  'http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim());

// handlebars setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'hbs');

handlebars.registerPartials(
  path.join(__dirname, 'app_server', 'views', 'partials')
);

// request parsing logging static files and passport
app.use(logger('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// allow the angular app to call the api
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }

  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );

  // browser preflight request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

// connect urls to their routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);
app.use('/api', apiRouter);

// return a json response if passport rejects a token
app.use((error, req, res, next) => {
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'unauthorized request'
    });
  }

  return next(error);
});

// send unknown routes to the error handler
app.use((req, res, next) => {
  next(createError(404));
});

// api gets json errors while handlebars pages keep their error page
app.use((error, req, res, next) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(error.status || 500).json({
      message: error.status === 404
        ? 'api endpoint not found'
        : 'an unexpected api error occurred'
    });
  }

  res.locals.message = error.message;
  res.locals.error = req.app.get('env') === 'development' ? error : {};

  return res.status(error.status || 500).render('error');
});

module.exports = app;