import axios from 'axios';
import type { JobRequirements, Resume, GeneratedInterview, InterviewQuestion } from '../types';

// Backend types that differ from frontend types
interface BackendResume {
  filename: string;
  originalname: string;
  path: string;
  size: number;
}

interface BackendInterviewQuestion {
  id: string;
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Technical' | 'Behavioral' | 'Experience';
  evaluationCriteria: string;
}

interface BackendGeneratedInterview {
  questions: BackendInterviewQuestion[];
}

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload a resume file
 */
export const uploadResume = async (file: File, onProgress?: (progress: number) => void): Promise<BackendResume> => {
  const formData = new FormData();
  formData.append('resume', file);
  
  try {
    const response = await api.post('/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    
    return response.data.file;
  } catch (error) {
    throw error;
  }
};

/**
 * Convert backend resume format to frontend format
 */
export const adaptResumeToFrontend = (backendResume: BackendResume, file?: File): Resume => {
  return {
    id: Date.now().toString(),
    fileName: backendResume.originalname || (file ? file.name : 'Unknown'),
    fileSize: backendResume.size || (file ? file.size : 0),
    uploadedAt: new Date(),
    content: backendResume.path
  };
};

/**
 * Generate interview questions
 */
export const generateInterview = async (
  jobRequirements: JobRequirements,
  resumePath: string
): Promise<BackendGeneratedInterview> => {
  try {
    const response = await api.post('/interview/generate', {
      jobRequirements,
      resumePath,
    });
    
    return response.data.interview;
  } catch (error) {
    throw error;
  }
};

/**
 * Convert backend interview question to frontend format
 */
export const adaptQuestionToFrontend = (backendQuestion: BackendInterviewQuestion): InterviewQuestion => {
  return {
    id: backendQuestion.id || String(Math.random()).slice(2, 10),
    question: backendQuestion.text,
    category: mapCategory(backendQuestion.category),
    difficulty: mapDifficulty(backendQuestion.difficulty),
    suggestedTime: estimateSuggestedTime(backendQuestion.difficulty),
    // Add the missing fields from the backend response
    evaluationCriteria: backendQuestion.evaluationCriteria
  };
};

/**
 * Create a complete interview object from backend data
 */
export const createInterviewFromBackend = (
  backendInterview: BackendGeneratedInterview,
  jobRequirements: JobRequirements,
  resume: Resume
): GeneratedInterview => {
  const questions = backendInterview.questions.map(adaptQuestionToFrontend);
  
  return {
    id: Date.now().toString(),
    jobRequirements,
    resume,
    questions,
    generatedAt: new Date(),
    totalEstimatedTime: questions.reduce((total, q) => total + q.suggestedTime, 0)
  };
};

// Helper functions for data mapping
function mapCategory(backendCategory: string): 'technical' | 'behavioral' | 'situational' | 'experience' {
  const category = backendCategory.toLowerCase();
  if (category === 'technical') return 'technical';
  if (category === 'behavioral') return 'behavioral';
  if (category === 'experience') return 'experience';
  return 'situational'; // Default fallback
}

function mapDifficulty(backendDifficulty: string): 'easy' | 'medium' | 'hard' {
  const difficulty = backendDifficulty.toLowerCase();
  if (difficulty === 'easy') return 'easy';
  if (difficulty === 'medium') return 'medium';
  if (difficulty === 'hard') return 'hard';
  return 'medium'; // Default fallback
}

function estimateSuggestedTime(difficulty: string): number {
  const diff = difficulty.toLowerCase();
  if (diff === 'easy') return 3;
  if (diff === 'medium') return 5;
  if (diff === 'hard') return 8;
  return 5; // Default
};
