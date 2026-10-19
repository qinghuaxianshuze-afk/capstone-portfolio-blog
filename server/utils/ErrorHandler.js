// utils/ErrorHandler.js
// Lab 12 - Implementing the Central Error Handler (Step 1)
// Course    : Web Data Management and Application
// Instructor: Ahsan Shehzad
// Student   : Xianshu Ze  (24998025)
//
// The ErrorHandler Utility.
//
// A custom Error subclass used to STANDARDIZE error responses across the API.
// Whenever a controller or the 404 handler needs to signal a failure, it
// `throw`s (or `next()`s) a new ErrorHandler carrying both a human-readable
// message and the HTTP status code. The central error middleware
// (middleware/error.js) then reads those two properties and formats ONE
// consistent JSON error contract for every failure.
//
// Extending Error means `instanceof Error` still works and the native stack
// trace is captured; Error.captureStackTrace just trims this constructor's own
// frame so the trace points at the real call site.

/**
 * Custom error class used to standardize error responses.
 * When thrown, it ensures a message and a status code are available
 * for the central Express error handler.
 */
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Capture the stack trace to help with debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
