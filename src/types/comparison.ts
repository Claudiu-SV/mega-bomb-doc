export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'experience';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  rating: number; // 1-5 scale
  maxRating: number; // typically 5
  comments?: string;
  evaluationCriteria: string;
}

export interface InterviewAssessment {
  candidateName: string;
  jobTitle: string;
  department: string;
  experienceLevel: string;
  requiredSkills: string[];
  resumeFileName: string;
  generatedDate: Date;
  totalQuestions: number;
  totalDuration: number; // in minutes
  questionsRated: number;
  averageRating: number;
  questions: InterviewQuestion[];
  categoryBreakdown: {
    technical: number;
    behavioral: number;
    situational: number;
    experience: number;
  };
}

export interface Candidate {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  pdfFile?: File;
  interviewAssessment?: InterviewAssessment;
  scores?: CandidateScores;
}

export interface CandidateScores {
  averageRating: number;
  technicalScore: number;
  behavioralScore: number;
  situationalScore: number;
  experienceScore: number;
  consistencyScore: number; // How consistent ratings are across questions
  overallMatch: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  questionBreakdown: {
    highPerformance: InterviewQuestion[]; // Questions with rating >= 4
    lowPerformance: InterviewQuestion[]; // Questions with rating <= 2
  };
}

export interface ComparisonCriteria {
  jobTitle: string;
  requiredSkills: string[];
  experienceLevel: string;
  department: string;
  weightings: {
    technicalQuestions: number;
    behavioralQuestions: number;
    situationalQuestions: number;
    experienceQuestions: number;
    consistency: number; // Weight for rating consistency
  };
}

export interface CandidateComparison {
  id: string;
  criteria: ComparisonCriteria;
  candidates: Candidate[];
  createdAt: Date;
  updatedAt: Date;
}
