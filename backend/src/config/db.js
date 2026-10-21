const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas cluster
 * Handles timeouts and non-sensitive diagnostics
 */
let listenersRegistered = false;

function registerConnectionEvents() {
  if (listenersRegistered) return;

  mongoose.connection.on('connected', () => {
    console.log('MongoDB Atlas connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB Atlas connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB Atlas disconnected');
  });

  listenersRegistered = true;
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing from environment configuration');
  }

  registerConnectionEvents();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  return mongoose.connection;
}

module.exports = connectDB;
