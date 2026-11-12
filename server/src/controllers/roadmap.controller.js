import { Roadmap } from '../models/Roadmap.js';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { CareerFramework } from '../models/CareerFramework.js';
import { computeSkillGapAnalysis } from '../services/gapAnalysis.service.js';
import { generateAdaptiveRoadmap } from '../services/roadmap.service.js';
import { synthesizeCareerFramework } from '../services/gemini.service.js';

// @route   POST /api/v1/roadmaps/generate
// @desc    Generate a dynamic adaptive roadmap based on latest gap analysis
// @access  Private
export const generateRoadmap = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    const targetRole = req.body.targetRole?.trim() || user?.targetCareer || 'Data Scientist';
    const hoursPerDay = req.body.hoursPerDay || user?.studyParameters?.hoursPerDay || 2;

    // 1. Fetch user's active resume skills
    const latestResume = await Resume.findOne({
      userId,
      status: { $in: ['active', 'parsed', 'reviewed'] },
    }).sort({ createdAt: -1 });

    const userSkills = latestResume?.parsedProfile?.skills || [];

    // 2. Fetch or dynamically generate career framework for THIS specific role
    const normalizedRole = targetRole.toLowerCase();
    let framework = await CareerFramework.findOne({ normalizedTitle: normalizedRole });

    if (!framework) {
      console.log(`[Roadmap Engine] Synthesizing missing framework for: "${targetRole}"...`);
      const synthesized = await synthesizeCareerFramework(targetRole);
      framework = await CareerFramework.create({
        normalizedTitle: normalizedRole,
        displayTitle: synthesized.displayTitle || targetRole,
        overview: synthesized.overview,
        competencies: synthesized.competencies,
        metadata: {
          modelVersion: 'gemini-3.8-flash',
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // 3. Extract exact gaps against THIS target role
    const gapReport = computeSkillGapAnalysis(userSkills, framework.competencies);

    // 4. Synthesize personalized schedule for THIS target role
    const roadmapData = await generateAdaptiveRoadmap({
      targetRole: framework.displayTitle,
      missingGaps: gapReport.missingGaps,
      reinforcementNeeded: gapReport.reinforcementNeeded,
      hoursPerDay,
    });

    // 5. Save and return roadmap
    await Roadmap.updateMany({ userId, status: 'in_progress' }, { status: 'archived' });

    const newRoadmap = await Roadmap.create({
      userId,
      targetRole: framework.displayTitle,
      commitmentHoursPerDay: hoursPerDay,
      totalWeeks: roadmapData.totalWeeks,
      milestones: roadmapData.milestones,
      completionPercentage: 0,
      status: 'in_progress',
    });

    if (user) {
      user.targetCareer = framework.displayTitle;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: `Roadmap generated for ${framework.displayTitle}`,
      data: { roadmap: newRoadmap },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/roadmaps/active
// @desc    Get current user's active roadmap
// @access  Private
export const getActiveRoadmap = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const roadmap = await Roadmap.findOne({ userId, status: 'in_progress' }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { roadmap },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/v1/roadmaps/:roadmapId/tasks/:taskId/toggle
// @desc    Toggle completion status of an individual task
// @access  Private
export const toggleTaskProgress = async (req, res, next) => {
  try {
    const { roadmapId, taskId } = req.params;
    const userId = req.user._id || req.user.id;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }

    let taskFound = false;
    let totalTasks = 0;
    let completedTasks = 0;

    for (const milestone of roadmap.milestones) {
      for (const task of milestone.tasks) {
        totalTasks++;
        if (task._id.toString() === taskId) {
          task.completed = !task.completed;
          task.completedAt = task.completed ? new Date() : null;
          taskFound = true;
        }
        if (task.completed) {
          completedTasks++;
        }
      }
    }

    if (!taskFound) {
      return res.status(404).json({ success: false, message: 'Task not found in roadmap.' });
    }

    roadmap.completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    await roadmap.save();

    res.status(200).json({
      success: true,
      data: {
        roadmap,
        completionPercentage: roadmap.completionPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};