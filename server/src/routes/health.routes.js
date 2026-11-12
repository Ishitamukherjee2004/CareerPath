import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    success: true,
    message: 'CareerPath AI API is operational',
    timestamp: new Date().toISOString(),
    services: {
      server: 'healthy',
      database: dbStatus,
    },
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

export default router;