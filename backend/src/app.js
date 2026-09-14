import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SchemeSaathi API is running',
    timestamp: new Date().toISOString()
  });
});

export default app;
