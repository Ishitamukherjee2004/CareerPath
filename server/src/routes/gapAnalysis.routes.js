import { Router } from 'express';
import { getSkillGapReport } from '../controllers/gapAnalysis.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/gap', getSkillGapReport);

export default router;