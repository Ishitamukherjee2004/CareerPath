import { Router } from 'express';
import {
  startSession,
  submitAnswer,
  getInterviewHistory,
} from '../controllers/interview.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.post('/start', startSession);
router.post('/:sessionId/submit', submitAnswer);
router.get('/history', getInterviewHistory);

export default router;