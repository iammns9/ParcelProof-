const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Initialize server
const startServer = async () => {
  // Attempt Database Connection
  const conn = await connectDB();
  if (!conn) {
    console.error('[Server] Critical: Database connection could not be established. Process will exit.');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(` [ParcelProof Backend Server Running]`);
    console.log(` Port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('[Unhandled Rejection]', err.message);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('[Uncaught Exception]', err.message);
  });

  // Graceful shutdown
  const gracefulShutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] HTTP connections closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer();
