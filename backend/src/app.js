import express from 'express';
import cors from 'cors';

import chatRoutes from './routes/chatRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SchemeSaathi API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/profile', profileRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
