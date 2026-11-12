import mongoose from 'mongoose';

const competencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    importance: {
      type: String,
      enum: ['critical', 'important', 'nice_to_have'],
      default: 'important',
    },
    category: {
      type: String,
      enum: ['foundational', 'core_technical', 'advanced', 'tools_ecosystem'],
      default: 'core_technical',
    },
    skillsRequired: [
      {
        name: { type: String, required: true },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          default: 'intermediate',
        },
      },
    ],
    recommendedProject: {
      title: { type: String, default: '' },
      summary: { type: String, default: '' },
    },
  },
  { _id: false }
);

const careerFrameworkSchema = new mongoose.Schema(
  {
    normalizedTitle: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayTitle: { type: String, required: true },
    overview: { type: String, required: true },
    competencies: [competencySchema],
    metadata: {
      modelVersion: { type: String, default: 'gemini-2.5' },
      generatedAt: { type: Date, default: Date.now },
      expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Cache for 30 days
      },
    },
  },
  {
    timestamps: true,
  }
);

export const CareerFramework = mongoose.model('CareerFramework', careerFrameworkSchema);