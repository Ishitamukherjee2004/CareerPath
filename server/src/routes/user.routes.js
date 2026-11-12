import { Router } from 'express';
import { completeOnboarding, getUserProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect); // All user profile endpoints require a valid JWT

router.get('/profile', getUserProfile);
router.put('/onboarding', completeOnboarding);

export default router;