const AppError = require('./../utils/AppError');

// ! Database Errors:
// Handle Duplicate Field Errors in MongoDB
const handleDuplicateFieldsDB = (err, res) => {
  // If we handle the error for a specific field like email: return new AppError(`${err.keyValue.email}`, 400);

  // The following line works for any duplicate field error by using the first value in the key-value pair:
  return new AppError(
    `${Object.keys(err.keyValue)[0]} ${Object.values(err.keyValue)[0]} already exist`,
    404
  );
};

// Handle Cast Errors in MongoDB
const handleCastErrorDB = err => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

// Handle Validation Errors in MongoDB
const handleVlidationErrorDB = err => {
  const errorObjects = Object.values(err.errors).map(error => {
    return { [error.path]: error.message };
  });

  return new AppError(JSON.stringify(errorObjects), 400);
};

// !JWT Errors
const handleJWTError = err => new AppError('Invalid Token. Please log in again.', 401);
const handleJWTExpiredError = err =>
  new AppError('Your token has expired! Please log in again', 401);

// ! Send Error during Development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.statusCode,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

//!  Send Error during production
const sendErrorPord = (err, res) => {
  if (err.isOperational) {
    // Known operational errors are sent to the client with relevant messages
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // For unknown errors, send a generic message
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

// ! Main Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message, name: err.name };

    // Handle specific MongoDB errors
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError') error = handleVlidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorPord(error, res);
  }
};

module.exports = errorHandler;

/* 
  ! Notes:
   - When using object copying techniques like the spread operator ({ ...err }), only the object's own immediate  properties are copied. For example:
      ?  let error = { ...err, message: err.message };

     The `message` property is part of the `Error` class and may not be copied automatically when using these techniques. That is why it is explicitly added to the new object.

   ! MongoDB Errors:
     - Duplicate Key Error: MongoDB generates an error with code 11000 when a duplicate value is attempted to be inserted into a field with a unique index.
     - CastError: This occurs when trying to access an invalid `ObjectId` or perform invalid operations (like querying with incorrect types).
     - ValidationError: Triggered when a document fails schema validation, often containing multiple sub-errors.

  

   ! Error Handling Strategy:
     - During development (`NODE_ENV=development`), all error details, including stack traces, are sent to the client for easier debugging.
     - During production (`NODE_ENV=production`), only operational errors are sent to the client, while unknown errors return a generic message to avoid leaking sensitive information.
*/

/* 
! Read please 

- An advanced error-handling strategy in Node.js and Express involves a comprehensive approach that covers different types of errors, ensures clarity in error reporting, and enhances the overall user experience while maintaining security. Here is a breakdown of an advanced error strategy:

- Centralized Error Handling Middleware: Use a dedicated error-handling middleware function to handle all errors in one place. This function should capture both operational errors (e.g., database connection failures, invalid user inputs) and programming errors (e.g., bugs in code). The middleware should be placed after all route handlers to ensure that any error that occurs anywhere in the app is caught.

- Error Types and Categorization: Define custom error classes to differentiate between various error types, such as client errors (e.g., 400 Bad Request, 404 Not Found), server errors (e.g., 500 Internal Server Error), and application-specific errors (e.g., ValidationError, DatabaseError). This categorization helps in understanding the nature of the error and responding appropriately.

- Error Logging: Implement robust error logging to track all errors that occur within the application. Use a logging library such as Winston or Bunyan to capture detailed error information, including stack traces, request data, and user information. These logs should be stored securely and monitored continuously to identify and address recurring issues.

- Graceful Error Responses: Provide clear and user-friendly error messages in the response, avoiding technical jargon or stack traces that could confuse end users or expose sensitive information. Tailor responses based on the environment — for example, in a development environment, display detailed error messages, while in production, show a generic error message to prevent information leakage.

- Asynchronous Error Handling: Ensure that errors in asynchronous code, such as Promises or asynchronous functions, are properly handled. Use try-catch blocks for async/await patterns and ensure that all Promises have .catch() handlers. This prevents unhandled promise rejections that could crash the application.

- Error Notification and Alerting: Set up automated monitoring and alerting tools (e.g., Sentry, Datadog, New Relic) to notify the development team of critical errors in real time. These tools provide insight into the frequency, severity, and context of errors, enabling a faster response to issues.
*/
