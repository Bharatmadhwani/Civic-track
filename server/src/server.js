import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { ensureSeedData } from './services/seedService.js';

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await ensureSeedData();

    const server = app.listen(PORT, () => {
      console.log('========================================================');
      console.log(`[CivicTrack Server] Running at: http://localhost:${PORT}`);
      console.log(`[CivicTrack API] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[Environment] Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log('========================================================');
    });

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Closing HTTP server...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server Error] Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
