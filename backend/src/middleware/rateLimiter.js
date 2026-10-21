const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter for Authentication Endpoints
 * Guards against brute-force password guessing and automated credential stuffing
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Limit each IP to 25 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip in automated testing
});

module.exports = {
  authLimiter,
};
