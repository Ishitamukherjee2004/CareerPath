import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] CareerPath API running on http://localhost:${PORT}`);
      console.log(`[Environment] Mode: ${process.env.NODE_ENV}`);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Unhandled Rejection]', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('[Uncaught Exception]', error);
      process.exit(1);
    });
  } catch (error) {
    console.error(`[Fatal Server Error] ${error.message}`);
    process.exit(1);
  }
};

startServer();