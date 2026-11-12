import { Router } from 'express';
import { researchCareer } from '../controllers/career.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { startCodeDrill, submitCodeDrillFix } from '../controllers/codeDrill.controller.js';
const router = Router();

router.use(protect);

router.post('/research', researchCareer);
router.post('/start', startCodeDrill);
router.post('/submit', submitCodeDrillFix);
export default router;