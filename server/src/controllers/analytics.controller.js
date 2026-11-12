import { Resume } from '../models/Resume.js';
import { Roadmap } from '../models/Roadmap.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { User } from '../models/User.js';
import { CareerFramework } from '../models/CareerFramework.js';
import { computeSkillGapAnalysis } from '../services/gapAnalysis.service.js';
import { synthesizeAtsResumeBullets } from '../services/analytics.service.js';

// @route   GET /api/v1/analytics/overview
// @desc    Retrieve unified Career Readiness Index and telemetry
// @access  Private
export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    const targetRole = user?.targetCareer || 'Full Stack Developer';

    // 1. Resume Gap Evidence Score
    const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    const userSkills = latestResume?.parsedProfile?.skills || [];

    const framework = await CareerFramework.findOne({
      normalizedTitle: targetRole.toLowerCase(),
    });
    const gapReport = computeSkillGapAnalysis(userSkills, framework?.competencies || []);
    const resumeScore = gapReport.overallReadinessScore || 0;

    // 2. Roadmap Milestone Completion
    const activeRoadmap = await Roadmap.findOne({
      userId,
      status: 'in_progress',
    }).sort({ createdAt: -1 });
    const roadmapScore = activeRoadmap?.completionPercentage || 0;

    // 3. Mock Interview Session Average
    const interviewSessions = await InterviewSession.find({ userId });
    let interviewScore = 0;
    if (interviewSessions.length > 0) {
      const totalSessionAvg = interviewSessions.reduce((acc, s) => acc + (s.averageScore || 0), 0);
      interviewScore = Math.round(totalSessionAvg / interviewSessions.length);
    }

    // 4. Calculate Unified Career Readiness Index (CRI)
    const cri = Math.round(
      0.35 * resumeScore + 0.30 * roadmapScore + 0.35 * (interviewScore || resumeScore * 0.8)
    );

    // 5. Aggregate Unaddressed Edge Cases from Interview History
    const commonEdgeCases = [];
    interviewSessions.forEach((s) => {
      s.turns.forEach((t) => {
        if (t.evaluation?.missingEdgeCases) {
          commonEdgeCases.push(...t.evaluation.missingEdgeCases);
        }
      });
    });
    const uniqueTraps = [...new Set(commonEdgeCases)].slice(0, 4);

    res.status(200).json({
      success: true,
      data: {
        cri,
        targetRole,
        breakdown: {
          resumeReadiness: resumeScore,
          roadmapCompletion: roadmapScore,
          interviewAptitude: interviewScore,
        },
        activeRoadmap: activeRoadmap
          ? {
              totalWeeks: activeRoadmap.totalWeeks,
              completionPercentage: activeRoadmap.completionPercentage,
              totalTasks: activeRoadmap.milestones.reduce((acc, m) => acc + m.tasks.length, 0),
            }
          : null,
        topSkillGaps: gapReport.missingGaps.slice(0, 5).map((g) => g.name),
        unaddressedTraps: uniqueTraps,
        interviewSessionsCount: interviewSessions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/analytics/resume-bullets
// @desc    Generate ATS-aligned resume impact bullets from completed milestones
// @access  Private
export const generateResumeBullets = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    const targetRole = user?.targetCareer || 'Full Stack Developer';

    const activeRoadmap = await Roadmap.findOne({ userId, status: 'in_progress' });
    const completedProjects = [];

    if (activeRoadmap) {
      activeRoadmap.milestones.forEach((m) => {
        const allTasksDone = m.tasks.every((t) => t.completed);
        if (allTasksDone && m.deliverableProject?.title) {
          completedProjects.push(m.deliverableProject);
        }
      });
    }

    const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    const skills = latestResume?.parsedProfile?.skills?.map((s) => s.name) || [];

    const bullets = await synthesizeAtsResumeBullets({
      targetRole,
      completedProjects,
      demonstratedSkills: skills,
    });

    res.status(200).json({
      success: true,
      data: { bullets },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/analytics/export-dossier
// @desc    Retrieve structured dossier payload for printing/exporting
// @access  Private
export const getCandidateDossier = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    const targetRole = user?.targetCareer || 'Full Stack Developer';

    const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    const userSkills = latestResume?.parsedProfile?.skills || [];

    const framework = await CareerFramework.findOne({
      normalizedTitle: targetRole.toLowerCase(),
    });
    const gapReport = computeSkillGapAnalysis(userSkills, framework?.competencies || []);

    const activeRoadmap = await Roadmap.findOne({
      userId,
      status: 'in_progress',
    }).sort({ createdAt: -1 });

    const interviewSessions = await InterviewSession.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        candidateName: user.name,
        targetRole,
        generatedAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        skills: userSkills.map((s) => s.name),
        missingGaps: gapReport.missingGaps.map((g) => g.name),
        reinforcementNeeded: gapReport.reinforcementNeeded.map((r) => r.name),
        roadmap: activeRoadmap
          ? {
              totalWeeks: activeRoadmap.totalWeeks,
              completionPercentage: activeRoadmap.completionPercentage,
              milestones: activeRoadmap.milestones,
            }
          : null,
        recentInterviewScores: interviewSessions.map((s) => ({
          date: s.createdAt,
          difficulty: s.difficulty,
          averageScore: s.averageScore,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/analytics/seed-demo
// @desc    Seeds realistic test data (mock scores, roadmap tasks, gaps) for testing/demoing
// @access  Private
export const seedDemoData = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const User = (await import('../models/User.js')).User;
    const Resume = (await import('../models/Resume.js')).Resume;
    const Roadmap = (await import('../models/Roadmap.js')).Roadmap;
    const InterviewSession = (await import('../models/InterviewSession.js')).InterviewSession;

    // 1. Update user target role
    await User.findByIdAndUpdate(userId, { targetCareer: 'Full Stack Developer' });

    // 2. Ensure an active resume profile exists
    await Resume.findOneAndUpdate(
      { userId },
      {
        userId,
        fileName: 'demo_resume.pdf',
        status: 'active',
        parsedProfile: {
          skills: [
            { name: 'JavaScript', category: 'frontend', confidenceScore: 0.95 },
            { name: 'React', category: 'frontend', confidenceScore: 0.92 },
            { name: 'Node.js', category: 'backend', confidenceScore: 0.88 },
            { name: 'Express', category: 'backend', confidenceScore: 0.85 },
            { name: 'MongoDB', category: 'database', confidenceScore: 0.82 },
            { name: 'Git', category: 'devops', confidenceScore: 0.90 }
          ]
        }
      },
      { upsert: true, new: true }
    );

    // 3. Populate an active Roadmap with real progress
    await Roadmap.deleteMany({ userId });
    await Roadmap.create({
      userId,
      targetRole: 'Full Stack Developer',
      commitmentHoursPerDay: 2,
      totalWeeks: 6,
      completionPercentage: 50,
      status: 'in_progress',
      milestones: [
        {
          weekNumber: 1,
          title: 'Advanced Asynchronous Node.js & Stream Buffers',
          focusArea: 'Backend Architecture',
          weeklyGoal: 'Master non-blocking I/O, pipeline streams, and event loop starvation mitigations.',
          deliverableProject: {
            title: 'High-Throughput File Ingestion Gateway',
            description: 'Engineered a chunked upload processor with backpressure handling using Node streams.'
          },
          tasks: [
            { title: 'Implement stream pipeline with zlib compression', completed: true },
            { title: 'Benchmark event loop lag using clinic.js under load', completed: true }
          ]
        },
        {
          weekNumber: 2,
          title: 'Distributed In-Memory Caching & Thundering Herd Defense',
          focusArea: 'Data Layer',
          weeklyGoal: 'Deploy Redis with single-flight mutexes and jittered TTL strategies.',
          deliverableProject: {
            title: 'Redis Resilient Microservice Cache',
            description: 'Built a multi-tier cache-aside layer with distributed locks preventing thundering herds.'
          },
          tasks: [
            { title: 'Set up Redlock mutex pattern for concurrent misses', completed: true },
            { title: 'Integrate probabilistic early expiration (XFetch)', completed: false }
          ]
        }
      ]
    });

    // 4. Seed a finished Mock Interview Session
    await InterviewSession.deleteMany({ userId });
    await InterviewSession.create({
      userId,
      targetRole: 'Full Stack Developer',
      difficulty: 'mid',
      averageScore: 78,
      status: 'completed',
      turns: [
        {
          question: 'How do you handle high write-traffic database spikes without overwhelming primary storage?',
          category: 'system_design',
          difficulty: 'mid',
          userAnswer: 'I would set up BullMQ with Redis to accept writes with a 202 status and micro-batch writes to Mongo.',
          evaluation: {
            score: 85,
            technicalAccuracy: 'Solid asynchronous architecture. Using message queues with 202 Accepted prevents thread starvation.',
            missingEdgeCases: ['Cache penetration for non-existent keys', 'Dead letter queue (DLQ) retry policies'],
            idealResponseSummary: 'A staff engineer balances queue backpressure with bulk upsert operations to stabilize IOPS.',
            evaluatedAt: new Date()
          }
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Demo state initialized successfully.'
    });
  } catch (error) {
    next(error);
  }
};