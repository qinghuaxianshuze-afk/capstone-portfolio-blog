// middleware/error.js
// Lab 12 - The Central Error Handler (Step 3) + Challenge 1 + Challenge 2
// Course    : Web Data Management and Application
// Instructor: Ahsan Shehzad
// Student   : Xianshu Ze  (24998025)
//
// The centralized error-handling middleware - the API's "last line of defense".
// Express recognises an error handler by its FOUR arguments (err, req, res,
// next). Any time a controller (or the 404 handler) calls next(error), Express
// skips all normal middleware and jumps here, so EVERY failure is formatted
// into ONE consistent JSON error contract:
//
//     { success: false, status: <code>, message: <text> }
//
// CHALLENGE 1 (CastError -> 400): Mongoose throws an error with
// name === 'CastError' when an :id cannot be cast to an ObjectId (e.g.
// /api/posts/123). We detect it and rewrite it into a user-friendly message
// with a 400 status. We also map Mongoose ValidationError and duplicate-key
// errors to 400 so bad client input never surfaces as a raw 500.
//
// CHALLENGE 2 (never leak the stack in production): the internal stack trace
// is attached to the response ONLY when NODE_ENV === 'development'. In
// production the stack is omitted entirely so we never expose internal file
// paths to clients.

/**
 * Centralized error handler middleware.
 * This runs when an error is passed via next(error).
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  // Default status/message, then refine per error type.
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // -------------------------------------------------------------------------
  // CHALLENGE 1: Mongoose CastError (invalid ObjectId format) -> 400
  // -------------------------------------------------------------------------
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found. Invalid ID format.';
  }

  // Mongoose validation failure (missing/invalid fields) -> 400
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message; // keep the descriptive "Post validation failed: ..."
  }

  // Duplicate key (e.g. a second user with the same unique username) -> 400
  else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate value: that record already exists.';
  }

  // Build the consistent error contract.
  const responseBody = {
    success: false,
    status: statusCode,
    message,
  };

  // -------------------------------------------------------------------------
  // CHALLENGE 2: include the stack ONLY in development; never in production.
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV === 'development') {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};

module.exports = errorHandlerMiddleware;
