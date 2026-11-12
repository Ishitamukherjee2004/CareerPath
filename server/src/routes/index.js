import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import resumeRoutes from './resume.routes.js';
import gapRoutes from './gapAnalysis.routes.js';
import careerRoutes from './career.routes.js';
import roadmapRoutes from './roadmap.routes.js';
import interviewRoutes from './interview.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

// Mount modules
router.use('/', healthRoutes);
router.use('/interviews', interviewRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/auth', authRoutes);
router.use('/careers', careerRoutes);
router.use('/resume', resumeRoutes);
router.use('/users', userRoutes);
router.use('/analysis', gapRoutes);
router.use('/roadmaps', roadmapRoutes);

export default router;