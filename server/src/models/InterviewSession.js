import mongoose from 'mongoose';

const turnSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: {
      type: String,
      enum: ['system_design', 'internals', 'debugging', 'behavioral_technical'],
      default: 'internals',
    },
    difficulty: {
      type: String,
      enum: ['junior', 'mid', 'senior'],
      default: 'mid',
    },
    userAnswer: { type: String, default: '' },
    evaluation: {
      score: { type: Number, default: 0 },
      technicalAccuracy: { type: String, default: '' },
      missingEdgeCases: [String],
      idealResponseSummary: { type: String, default: '' },
      evaluatedAt: { type: Date, default: null },
    },
  },
  { _id: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: { type: String, required: true },
    difficulty: { type: String, default: 'mid' },
    averageScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    turns: [turnSchema],
  },
  {
    timestamps: true,
  }
);

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);