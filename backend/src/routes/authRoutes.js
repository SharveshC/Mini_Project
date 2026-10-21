const express = require('express');
const { register, login, logout, getMe, getCsrfToken } = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { verifyCsrf } = require('../middleware/csrf');

const router = express.Router();

// State-changing auth routes protected by rate limiting and CSRF verification
router.post('/register', authLimiter, verifyCsrf, register);
router.post('/login', authLimiter, verifyCsrf, login);

// Session and CSRF routes
router.get('/csrf-token', getCsrfToken);
router.get('/me', getMe);

// Protected logout route with CSRF verification
router.post('/logout', verifyCsrf, logout);

module.exports = router;
