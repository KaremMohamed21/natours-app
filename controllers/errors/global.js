const AppError = require('../../utils/appError');

/** HANDLE MONGODB ERRORS */
// HANDLE CastError to appear to the client
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// HANDLE Duplicate fields error to appear to the client
const handleDuplicateFieldsDB = err => {
  const name = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `The tour ${name} exists. Please try another name.`;

  return new AppError(message, 400);
};

// HANDLE Validation Error to appear to the client
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `This rules is wrong. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

// HANDLE JWT Error
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

// HANDLE Expired JWT Error
const handleJWTExpiredError = () =>
  new AppError('Invalid token. Please log in again', 401);

// HANDLE DEVELOPMENT ERRORS
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // B) RENDERED WEBSITES
  // console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

// HANDLE PRODUCTION ERROR
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }

    // B) Programming or other unknown error: don't leak error details
    // Print error to server logs
    console.error('ERROR 💥', err);
    // Send Generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }

  // RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  // B) Programming or other unknown error: don't leak error details
  // Print error to server logs
  console.error('ERROR 💥', err);
  // Send Generic message
  return res.status(500).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

/* GLOBAL ERROR HANDLER */
module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  // Check if the error is development or production
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
