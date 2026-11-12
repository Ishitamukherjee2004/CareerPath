import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Onboarding & Profile Attributes
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    targetCareer: {
      type: String,
      trim: true,
      default: '',
    },
    education: {
      institution: { type: String, default: '' },
      degree: { type: String, default: '' },
      graduationYear: { type: Number, default: null },
    },
    experienceLevel: {
      type: String,
      enum: ['student', 'entry_level', 'mid_level', 'senior', 'transitioning', ''],
      default: 'student',
    },
    studyParameters: {
      hoursPerDay: { type: Number, min: 1, max: 16, default: 2 },
      targetDurationMonths: { type: Number, min: 1, max: 24, default: 6 },
      learningStyle: {
        type: String,
        enum: ['hands_on', 'conceptual', 'project_first', 'balanced'],
        default: 'balanced',
      },
    },
    selfReportedSkills: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);