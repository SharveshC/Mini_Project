const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./src/config/db');
const configureSession = require('./src/config/session');
const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// Trust reverse proxy in production (e.g., Render, Vercel, Nginx) for secure cookie forwarding
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cross-Origin Resource Sharing (CORS) with credentials support
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  })
);

// Request parsing middleware with sensible size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Session middleware with MongoDB Atlas session store
app.use(configureSession());

// Health check routes
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Pennywise API is running!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Transaction routes (CRUD & Aggregation)
app.use('/api/transactions', transactionRoutes);

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server after connecting to MongoDB Atlas
const PORT = process.env.PORT || 5000;

async function startServer(customPort) {
  try {
    await connectDB();

    const port = customPort || process.env.PORT || 5000;
    const server = app.listen(port, () => {
      console.log(`Pennywise backend server running on http://localhost:${port}`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('\nGracefully shutting down Pennywise server...');
      server.close(async () => {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);

    
    process.on('SIGTERM', shutdown);

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Promise Rejection:', reason);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start server if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
