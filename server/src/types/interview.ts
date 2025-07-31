export interface InterviewQuestion {
  id: string;
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Technical' | 'Behavioral' | 'Experience';
  evaluationCriteria: string;
}

export interface GeneratedInterview {
  questions: InterviewQuestion[];
}

export interface JobRequirements {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceLevel?: string;
  education?: string;
}

export interface Resume {
  filename: string;
  originalname: string;
  path: string;
  size: number;
}

export interface UploadProgress {
  percent: number;
  loaded: number;
  total: number;
}
