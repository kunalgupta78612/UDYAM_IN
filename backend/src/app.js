import express from 'express';
import cors from 'cors';

import chatRoutes from './routes/chatRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import calculatorRoutes from './routes/calculatorRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/database.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Auto-connect database for serverless requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    try {
      await connectDB();
    } catch (e) {
      console.error('[DB Middleware Error]:', e.message);
    }
  }
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'UDYAM SETU API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/partners', partnerRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;

