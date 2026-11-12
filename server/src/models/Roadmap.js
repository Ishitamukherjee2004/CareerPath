import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    estimatedHours: { type: Number, default: 2 },
    resourceQuery: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: true }
);

const milestoneSchema = new mongoose.Schema(
  {
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
    focusArea: { type: String, required: true },
    weeklyGoal: { type: String, required: true },
    tasks: [taskSchema],
    deliverableProject: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      completed: { type: Boolean, default: false },
    },
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: { type: String, required: true },
    commitmentHoursPerDay: { type: Number, default: 2 },
    totalWeeks: { type: Number, required: true },
    completionPercentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'archived'],
      default: 'in_progress',
    },
    milestones: [milestoneSchema],
  },
  {
    timestamps: true,
  }
);

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);