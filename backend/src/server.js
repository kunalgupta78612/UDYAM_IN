import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 5000;

// Connect to Database & Start Server
const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await connectDB();
  }
  
  app.listen(PORT, () => {
    console.log(`[Server] UDYAM SETU Backend running on port ${PORT}`);
  });
};

startServer();
