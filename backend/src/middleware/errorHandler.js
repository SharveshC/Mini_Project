/**
 * Centralized Express Error Handling Middleware
 * Ensures consistent JSON response formats across the API
 * Never exposes database credentials, secrets, or internal stack traces to clients
 */

// 404 Not Found Middleware
function notFoundHandler(req, res, _next) {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Global Error Handler
function errorHandler(err, req, res, _next) {
  // If response headers have already been sent, delegate to default Express handler
  if (res.headersSent) {
    return _next(err);
  }

  // Log server-side for debugging (sanitized)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);
  }

  // Handle Mongoose Validation Error (400)
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors || {}).map((field) => ({
      field,
      message: err.errors[field].message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId format) (400)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field '${err.path}'`,
      errors: [
        {
          field: err.path,
          message: `Value '${err.value}' is not valid`,
        },
      ],
    });
  }

  // Handle MongoDB Duplicate Key Error (E11000) (409)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
      errors: [
        {
          field,
          message: `${field} must be unique`,
        },
      ],
    });
  }

  // Handle JSON Parsing Syntax Errors (400)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body',
    });
  }

  // Handle custom application errors with explicit status code
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
