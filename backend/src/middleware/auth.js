/**
 * Authentication Guard Middleware
 * Ensures the user has an active, authenticated server session
 */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to continue.',
    });
  }

  // Attach userId to request for convenience in downstream controllers
  req.userId = req.session.userId;
  next();
}

module.exports = {
  requireAuth,
};
