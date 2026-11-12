import { Router } from 'express';
import { uploadResume, getActiveResume, updateReviewedSkills } from '../controllers/resume.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../config/multer.js';

const router = Router();

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/active', getActiveResume);
router.put('/:id/review', updateReviewedSkills);

export default router;