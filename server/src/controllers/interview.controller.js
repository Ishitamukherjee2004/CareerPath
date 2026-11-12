import { InterviewSession } from '../models/InterviewSession.js';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import {
  generateInterviewQuestion,
  gradeCandidateAnswer,
} from '../services/interview.service.js';

// @route   POST /api/v1/interviews/start
// @desc    Start a new mock session and generate question 1
// @access  Private
export const startSession = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    const targetRole = req.body.targetRole?.trim() || user?.targetCareer || 'Full Stack Developer';
    const difficulty = req.body.difficulty || 'mid';

    // Fetch user skills to target specific gaps
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    const skills = resume?.parsedProfile?.skills?.map((s) => s.name) || [];

    const firstQ = await generateInterviewQuestion({
      targetRole,
      difficulty,
      focusSkills: skills,
      previousQuestions: [],
    });

    const session = await InterviewSession.create({
      userId,
      targetRole,
      difficulty,
      turns: [
        {
          question: firstQ.question,
          category: firstQ.category,
          difficulty,
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/v1/interviews/:sessionId/submit
// @desc    Submit answer, grade it, and generate the follow-up question
// @access  Private
export const submitAnswer = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;
    const userId = req.user._id || req.user.id;

    if (!answer || answer.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Answer cannot be empty.' });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const currentTurn = session.turns[session.turns.length - 1];
    if (currentTurn.evaluation?.evaluatedAt) {
      return res.status(400).json({ success: false, message: 'This question was already evaluated.' });
    }

    // Grade current answer
    const grade = await gradeCandidateAnswer({
      targetRole: session.targetRole,
      question: currentTurn.question,
      userAnswer: answer.trim(),
    });

    currentTurn.userAnswer = answer.trim();
    currentTurn.evaluation = {
      score: grade.score,
      technicalAccuracy: grade.technicalAccuracy,
      missingEdgeCases: grade.missingEdgeCases,
      idealResponseSummary: grade.idealResponseSummary,
      evaluatedAt: new Date(),
    };

    // Calculate rolling average score
    const evaluatedTurns = session.turns.filter((t) => t.evaluation?.evaluatedAt);
    const totalScore = evaluatedTurns.reduce((acc, t) => acc + (t.evaluation.score || 0), 0);
    session.averageScore = Math.round(totalScore / evaluatedTurns.length);

    // If session has fewer than 5 questions, synthesize next question
    let nextQuestion = null;
    if (session.turns.length < 5) {
      const prevQList = session.turns.map((t) => t.question);
      const nextQData = await generateInterviewQuestion({
        targetRole: session.targetRole,
        difficulty: session.difficulty,
        focusSkills: [],
        previousQuestions: prevQList,
      });

      session.turns.push({
        question: nextQData.question,
        category: nextQData.category,
        difficulty: session.difficulty,
      });

      nextQuestion = nextQData.question;
    } else {
      session.status = 'completed';
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: {
        session,
        latestEvaluation: currentTurn.evaluation,
        isCompleted: session.status === 'completed',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/v1/interviews/history
// @desc    Get all previous interview sessions for user
// @access  Private
export const getInterviewHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const sessions = await InterviewSession.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { sessions },
    });
  } catch (error) {
    next(error);
  }
};