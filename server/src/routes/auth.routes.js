import { Router } from 'express';
import { register, login, googleAuth, getCurrentUser } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validate.middleware.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/google', googleAuth);
router.get('/me', protect, getCurrentUser);

export default router;