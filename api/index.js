import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { ensureSeedData } from '../server/src/services/seedService.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    try {
      await connectDB();
      await ensureSeedData();
      isConnected = true;
    } catch (err) {
      console.error('[Vercel Serverless] DB connection error:', err.message);
    }
  }
  return app(req, res);
}
