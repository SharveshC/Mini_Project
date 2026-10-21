const session = require('express-session');
const { MongoStore } = require('connect-mongo');

/**
 * Configure Express session middleware backed by MongoDB Atlas
 * - Sessions are persisted in the 'sessions' collection
 * - Uses secure cookie flags (HttpOnly, SameSite, Secure in production)
 */
function configureSession() {
  const uri = process.env.MONGODB_URI;
  const secret = process.env.SESSION_SECRET || 'pennywise_fallback_session_secret_dev_only';
  const isProd = process.env.NODE_ENV === 'production';

  if (!process.env.SESSION_SECRET && isProd) {
    throw new Error('SESSION_SECRET environment variable is required in production');
  }

  return session({
    name: 'pennywise.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: uri,
      collectionName: 'sessions',
      touchAfter: 24 * 3600, // Lazy session update once every 24h unless data modified
      crypto: {
        secret,
      },
    }),
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  });
}

module.exports = configureSession;
