export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isOnboarded: boolean;
  targetCareer?: string
  avatar?: string;
  education?: {
    institution: string;
    degree: string;
    graduationYear: number | null;
  };
  experienceLevel?: string;
  studyParameters?: {
    hoursPerDay: number;
    targetDurationMonths: number;
    learningStyle: 'hands_on' | 'conceptual' | 'project_first' | 'balanced';
  };
  selfReportedSkills?: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}