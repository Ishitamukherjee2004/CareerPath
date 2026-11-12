import { Resume } from '../models/Resume.js';
import { CareerFramework } from '../models/CareerFramework.js';
import { User } from '../models/User.js';
import { synthesizeCareerFramework } from '../services/gemini.service.js';
import { computeSkillGapAnalysis } from '../services/gapAnalysis.service.js';

// @route   GET /api/v1/analysis/gap
// @desc    Evaluate active resume against target career benchmarks
// @access  Private
export const getSkillGapReport = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetRole = user.targetCareer || 'Full Stack Developer';

    // 1. Fetch user's active resume using userId
    const latestResume = await Resume.findOne({
      userId: userId,
      status: { $in: ['active', 'parsed', 'reviewed'] },
    }).sort({ createdAt: -1 });

    // 2. Extract skills from parsedProfile
    const userSkills = latestResume?.parsedProfile?.skills || [];

    // 3. Fetch or dynamically generate career framework benchmarks
    const normalizedRole = targetRole.trim().toLowerCase();
    let framework = await CareerFramework.findOne({
      normalizedTitle: normalizedRole,
      'metadata.expiresAt': { $gt: new Date() },
    });

    if (!framework) {
      const synthesized = await synthesizeCareerFramework(targetRole);
      framework = await CareerFramework.findOneAndUpdate(
        { normalizedTitle: normalizedRole },
        {
          normalizedTitle: normalizedRole,
          displayTitle: synthesized.displayTitle || targetRole,
          overview: synthesized.overview,
          competencies: synthesized.competencies,
          metadata: {
            modelVersion: 'gemini-1.5-flash',
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        },
        { upsert: true, new: true }
      );
    }

    // 4. Compute cross-referenced weighted gap analysis
    const analysisReport = computeSkillGapAnalysis(userSkills, framework.competencies);

    res.status(200).json({
      success: true,
      data: {
        targetRole: framework.displayTitle,
        hasUploadedResume: !!latestResume,
        resumeSkillsCount: userSkills.length,
        report: analysisReport,
      },
    });
  } catch (error) {
    next(error);
  }
};