import app from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/database.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('[Vercel Serverless DB Error]:', error.message);
  }
  return app(req, res);
}
