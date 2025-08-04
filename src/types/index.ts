export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive' | '';
export interface JobRequirements {
  id: string;
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: ExperienceLevel;
  department: string;
  createdAt: Date;
}

export interface JobRequirementsFavorite {
  id: string;
  title: string;
  description: string;
  requiredSkills: string;
  experienceLevel: ExperienceLevel;
  department: string;
  savedAt: Date;
}

export interface Resume {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  content?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'experience';
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedTime: number; // in minutes
  evaluationCriteria?: string; // What to look for in a good answer
  rating: number;
  comment?: string;
}

export interface GeneratedInterview {
  id: string;
  jobRequirements: JobRequirements;
  resume: Resume;
  questions: InterviewQuestion[];
  generatedAt: Date;
  totalEstimatedTime: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}
