import mongoose from 'mongoose';

const skillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['language', 'framework', 'database', 'tool', 'concept', 'other'],
      default: 'other',
    },
    evidenceLevel: {
      type: String,
      enum: ['demonstrated', 'mentioned', 'self_reported'],
      default: 'mentioned',
    },
    context: { type: String, default: '' },
  },
  { _id: false }
);

const projectItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    rawText: { type: String, select: false },
    parsedProfile: {
      summary: { type: String, default: '' },
      education: [
        {
          institution: String,
          degree: String,
          year: String,
        },
      ],
      skills: [skillItemSchema],
      projects: [projectItemSchema],
      experience: [
        {
          role: String,
          company: String,
          duration: String,
          description: String,
        },
      ],
    },
    status: {
      type: String,
      enum: ['parsed', 'reviewed', 'active'],
      default: 'parsed',
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model('Resume', resumeSchema);