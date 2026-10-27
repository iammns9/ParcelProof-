const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const net = require('net');

let memoryServer = null;
let isShuttingDown = false;

/**
 * Fast TCP probe to check if a local port is listening without waiting for Mongoose timeout.
 */
const isPortListening = (port, host = '127.0.0.1', timeoutMs = 400) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let hasResolved = false;

    const finish = (reachable) => {
      if (!hasResolved) {
        hasResolved = true;
        socket.destroy();
        resolve(reachable);
      }
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));

    try {
      socket.connect(port, host);
    } catch {
      finish(false);
    }
  });
};

/**
 * Seeds a default demo seller account if no accounts exist in the database.
 */
const seedDefaultData = async () => {
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Database is clean. Seeding default demo seller account...');
      const passwordHash = await User.hashPassword('Password123!');
      await User.create({
        fullName: 'Muhammad Tariq',
        email: 'seller@parcelproof.pk',
        passwordHash,
        shopName: 'Tariq Electronics Official',
        phone: '+92 300 1234567',
        shopAddress: 'Hafeez Centre, Floor 3, Gulberg, Lahore',
      });
      console.log('[Database] Default seller account created: seller@parcelproof.pk / Password123!');
    }
  } catch (seedErr) {
    console.warn('[Database] Seeding notice:', seedErr.message);
  }
};

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const targetUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parcelproof';
  const isDefaultLocalhost = targetUri.includes('127.0.0.1:27017') || targetUri.includes('localhost:27017');

  let shouldTryPrimary = true;
  if (isDefaultLocalhost) {
    // Fast probe: check if port 27017 is actually open in under 400ms
    const portOpen = await isPortListening(27017, '127.0.0.1', 300);
    if (!portOpen) {
      shouldTryPrimary = false;
      console.log('[Database] Port 27017 is inactive. Skipping to local persistent engine immediately...');
    }
  }

  // 1. Attempt connection to primary configured URI if eligible
  if (shouldTryPrimary) {
    try {
      console.log(`[Database] Connecting to: ${targetUri}`);
      const conn = await mongoose.connect(targetUri, {
        serverSelectionTimeoutMS: 2000,
      });

      console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}`);
      console.log(`[Database] Database name: ${conn.connection.name}`);
      await seedDefaultData();
      return conn;
    } catch (primaryError) {
      console.warn(`[Database] Primary MongoDB connection failed (${primaryError.message}).`);
    }
  }

  // 2. Persistent on-disk MongoDB fallback
  try {
    console.log('[Database] Initializing persistent MongoDB engine in storage/mongodb_data...');
    const { MongoMemoryServer } = require('mongodb-memory-server');

    const dbPath = path.resolve(__dirname, '../../storage/mongodb_data');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    // Safely remove stale lock file if present
    const lockFile = path.join(dbPath, 'mongod.lock');
    if (fs.existsSync(lockFile)) {
      try {
        fs.unlinkSync(lockFile);
      } catch {
        // If file is locked by a zombie mongod process from a previous abrupt crash, terminate it
        try {
          const { execSync } = require('child_process');
          execSync('taskkill /F /IM mongod* /T', { stdio: 'ignore' });
          fs.unlinkSync(lockFile);
        } catch {
          // Ignore
        }
      }
    }

    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'parcelproof',
          dbPath,
          storageEngine: 'wiredTiger',
        },
      });
    }

    const fallbackUri = memoryServer.getUri();
    console.log(`[Database] Persistent MongoDB engine active at: ${fallbackUri}`);

    const fallbackConn = await mongoose.connect(fallbackUri);
    console.log(`[Database] Connected successfully to persistent database on disk.`);
    console.log(`[Database] Storage Location: ${dbPath}`);
    console.log(`[Database] All seller accounts, parcels, and evidence persist across restarts.`);

    await seedDefaultData();
    return fallbackConn;
  } catch (fallbackError) {
    console.error('\n======================================================');
    console.error(' [Database Connection Notice] Could not connect to MongoDB');
    console.error(` Target URI: ${targetUri}`);
    console.error(` Persistent Engine Error: ${fallbackError.message}`);
    console.error('======================================================\n');
    return null;
  }
};

mongoose.connection.on('disconnected', () => {
  if (!isShuttingDown) {
    console.warn('[Database] Warning: MongoDB disconnected.');
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected.');
});

// Cleanup instance on exit
const cleanup = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  if (memoryServer) {
    try {
      await mongoose.disconnect();
      await memoryServer.stop();
    } catch {
      // Clean exit
    }
  }
};

process.once('SIGINT', cleanup);
process.once('SIGTERM', cleanup);
process.once('SIGUSR2', cleanup);

module.exports = connectDB;
