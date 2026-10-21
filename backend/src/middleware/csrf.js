const crypto = require('crypto');

/**
 * CSRF Protection Middleware
 * Generates and validates cryptographically secure anti-CSRF tokens
 * stored in the user's server-side session.
 */

// Initialize or retrieve CSRF token for the current session
function ensureCsrfToken(req) {
  if (!req.session) return null;
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

// Rotate CSRF token (called upon login/registration to prevent fixation)
function rotateCsrfToken(req) {
  if (!req.session) return null;
  req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  return req.session.csrfToken;
}

// Timing-safe comparison to prevent timing analysis attacks
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Middleware to verify CSRF token on state-changing requests
function verifyCsrf(req, res, next) {
  // Safe HTTP methods do not mutate state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const clientToken = req.headers['x-csrf-token'] || req.body?._csrf;
  const sessionToken = req.session ? req.session.csrfToken : null;

  if (!clientToken || !sessionToken || !safeCompare(clientToken, sessionToken)) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch or token missing',
    });
  }

  next();
}

module.exports = {
  ensureCsrfToken,
  rotateCsrfToken,
  verifyCsrf,
};
