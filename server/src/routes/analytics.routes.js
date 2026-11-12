import { Router } from 'express';
import {
  getAnalyticsOverview,
  generateResumeBullets,
  getCandidateDossier,
  seedDemoData
} from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/overview', getAnalyticsOverview);
router.post('/resume-bullets', generateResumeBullets);
router.get('/export-dossier', getCandidateDossier);
router.post('/seed-demo', seedDemoData);
export default router;