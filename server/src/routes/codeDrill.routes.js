import { Router } from 'express';
import { startCodeDrill, submitCodeDrillFix } from '../controllers/codeDrill.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/start', startCodeDrill);
router.post('/submit', submitCodeDrillFix);

export default router;