import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civictrack';

  // Attempt connection to the provided MongoDB URI with a short timeout
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to MongoDB at "${uri}": ${err.message}`);

    if (process.env.VERCEL) {
      throw new Error(
        `MongoDB connection failed on Vercel: ${err.message}. Please configure MONGODB_URI in your Vercel Project Environment Variables with a valid MongoDB Atlas connection string.`
      );
    }

    console.log('[Database] Attempting fallback to embedded In-Memory MongoDB for seamless demo/testing...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          launchTimeout: 60000,
        },
      });
      const memUri = memoryServer.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] Connected to In-Memory MongoDB Server at: ${memUri}`);
      console.log('[Database] NOTE: Data will persist in memory while the server runs. Configure MONGODB_URI in server/.env for permanent persistence.');
      return conn;
    } catch (memErr) {
      console.error('[Database] Failed to initialize In-Memory MongoDB:', memErr.message);
      throw new Error(`Database connection failed: ${err.message}. Please start local MongoDB or provide MONGODB_URI in .env.`);
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    console.log('[Database] Disconnected successfully');
  } catch (err) {
    console.error('[Database] Disconnect error:', err.message);
  }
};
