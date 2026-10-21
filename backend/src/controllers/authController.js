const User = require('../models/User');
const { ensureCsrfToken, rotateCsrfToken } = require('../middleware/csrf');

/**
 * Auth Controller
 * Handles user registration, login with session regeneration,
 * session verification, logout, and anti-CSRF token distribution.
 */

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Validate presence and basic formats
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters long',
      });
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Hash password and save new user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    // Regenerate session to prevent Session Fixation on registration
    req.session.regenerate((regenErr) => {
      if (regenErr) return next(regenErr);

      req.session.userId = user._id.toString();
      const csrfToken = rotateCsrfToken(req);

      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);

        res.status(201).json({
          success: true,
          message: 'Account registered successfully',
          data: {
            user: user.toJSON(),
            csrfToken,
          },
        });
      });
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email and password are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Select passwordHash explicitly since it is marked select: false
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    // Generic error message prevents username enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Regenerate session ID to prevent Session Fixation attacks
    req.session.regenerate((regenErr) => {
      if (regenErr) return next(regenErr);

      req.session.userId = user._id.toString();
      const csrfToken = rotateCsrfToken(req);

      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);

        res.status(200).json({
          success: true,
          message: 'Logged in successfully',
          data: {
            user: user.toJSON(),
            csrfToken,
          },
        });
      });
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
function logout(req, res, next) {
  if (!req.session) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  req.session.destroy((destroyErr) => {
    if (destroyErr) return next(destroyErr);

    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('pennywise.sid', {
      path: '/',
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'No active session found',
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      // User was deleted from DB; clear invalid session
      req.session.destroy(() => {});
      res.clearCookie('pennywise.sid');
      return res.status(401).json({
        success: false,
        message: 'Session user no longer exists',
      });
    }

    const csrfToken = ensureCsrfToken(req);

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        csrfToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/csrf-token
function getCsrfToken(req, res) {
  const csrfToken = ensureCsrfToken(req);
  res.status(200).json({
    success: true,
    data: {
      csrfToken,
    },
  });
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  getCsrfToken,
};
