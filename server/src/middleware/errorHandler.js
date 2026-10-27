const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Multer errors and file filter errors
  if (err.name === 'MulterError' || err.message?.includes('Unsupported file type')) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'The uploaded file exceeds the maximum permitted file size limit.';
    } else {
      message = err.message || `Upload error: ${err.message}`;
    }
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid identifier: ${err.value}`;
  }

  // Handle MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  // Handle MongoDB Connection / Server Selection Errors
  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError' || err.message?.includes('ECONNREFUSED')) {
    statusCode = 503;
    message = 'Database service is temporarily initializing. Please try again in a moment.';
  }

  // Log in development
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[Unhandled Server Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
