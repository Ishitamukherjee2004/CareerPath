import { Router } from 'express';
import {
  generateRoadmap,
  getActiveRoadmap,
  toggleTaskProgress,
} from '../controllers/roadmap.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/generate', generateRoadmap);
router.get('/active', getActiveRoadmap);
router.patch('/:roadmapId/tasks/:taskId/toggle', toggleTaskProgress);

export default router;