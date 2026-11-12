import { User } from '../models/User.js';

// @route   PUT /api/v1/users/onboarding
// @desc    Complete user onboarding profile
// @access  Private
export const completeOnboarding = async (req, res, next) => {
  try {
    const {
      targetCareer,
      institution,
      degree,
      graduationYear,
      experienceLevel,
      hoursPerDay,
      targetDurationMonths,
      learningStyle,
      selfReportedSkills,
    } = req.body;

    if (!targetCareer || targetCareer.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A target career must be specified.',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        targetCareer: targetCareer.trim(),
        education: {
          institution: institution || '',
          degree: degree || '',
          graduationYear: graduationYear ? Number(graduationYear) : null,
        },
        experienceLevel: experienceLevel || 'student',
        studyParameters: {
          hoursPerDay: Number(hoursPerDay) || 2,
          targetDurationMonths: Number(targetDurationMonths) || 6,
          learningStyle: learningStyle || 'balanced',
        },
        selfReportedSkills: Array.isArray(selfReportedSkills) ? selfReportedSkills : [],
        isOnboarded: true,
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/users/profile
// @desc    Fetch latest profile data
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};