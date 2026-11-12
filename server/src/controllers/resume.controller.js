import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { parseResumeBuffer } from '../services/resumeParser.service.js';

// @route   POST /api/v1/resumes/upload
// @desc    Upload PDF, parse skills and evidence
// @access  Private
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded. Please upload your resume in .pdf format.',
      });
    }

    const { rawText, summary, skills, projects } = await parseResumeBuffer(req.file.buffer);

    // Deactivate previous active resumes for this user
    await Resume.updateMany({ userId: req.user._id }, { status: 'parsed' });

    const newResume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      rawText,
      parsedProfile: {
        summary,
        skills,
        projects,
      },
      status: 'active',
    });

    // Mirror detected skill names into User model
    const skillNames = skills.map((s) => s.name);
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { selfReportedSkills: { $each: skillNames } },
    });

    res.status(201).json({
      success: true,
      message: 'Resume analyzed and evidence extracted successfully',
      data: {
        resume: newResume,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/resumes/active
// @desc    Get current user's active parsed resume
// @access  Private
export const getActiveResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id, status: 'active' });
    res.status(200).json({
      success: true,
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/v1/resumes/:id/review
// @desc    Update extracted skills after user review
// @access  Private
export const updateReviewedSkills = async (req, res, next) => {
  try {
    const { skills, projects } = req.body;

    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    if (skills) resume.parsedProfile.skills = skills;
    if (projects) resume.parsedProfile.projects = projects;
    resume.status = 'reviewed';
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Profile evidence saved successfully',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};