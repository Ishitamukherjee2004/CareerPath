import { generateCodeDrill, evaluateCodeFix } from '../services/codeDrill.service.js';
import { User } from '../models/User.js';

export const startCodeDrill = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    let targetRole = 'Full Stack Developer';

    if (userId) {
      try {
        const user = await User.findById(userId);
        if (user?.targetCareer) targetRole = user.targetCareer;
      } catch (e) {
        console.warn('[CodeDrill Controller] User lookup skipped, using fallback role');
      }
    }

    const { difficulty = 'mid' } = req.body || {};
    const drill = await generateCodeDrill({ targetRole, difficulty });

    return res.status(200).json({
      success: true,
      data: { drill },
    });
  } catch (error) {
    console.error('[CodeDrill Controller Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to start code drill',
    });
  }
};

export const submitCodeDrillFix = async (req, res, next) => {
  try {
    const { scenarioDescription, buggyCode, candidateCode, candidateExplanation } = req.body;

    if (!candidateCode || !candidateCode.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your modified code.' });
    }

    const review = await evaluateCodeFix({
      scenarioDescription: scenarioDescription || 'Buggy production code scenario',
      buggyCode: buggyCode || '',
      candidateCode,
      candidateExplanation: candidateExplanation || '',
    });

    return res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    console.error('[CodeDrill Submit Error]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to review code patch',
    });
  }
};