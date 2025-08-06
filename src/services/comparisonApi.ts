import axios from 'axios';
import type { Candidate, CandidateScores, ComparisonCriteria } from '../types/comparison';

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ComparisonRequest {
  criteria: ComparisonCriteria;
  candidates: Candidate[];
}

interface ComparisonResponse {
  results: Array<{
    candidateId: string;
    scores: CandidateScores;
  }>;
}

/**
 * Upload a candidate Interview Assessment PDF and extract data
 */
export const uploadInterviewAssessmentPDF = async (
  file: File, 
  candidateId: string,
  onProgress?: (progress: number) => void
): Promise<{ interviewAssessment: any }> => {
  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('candidateId', candidateId);
  
  const response = await api.post('/comparison/upload-pdf', formData, {
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

  return response.data.data;
};

/**
 * Analyze and compare candidates
 */
export const analyzeCandidates = async (
  criteria: ComparisonCriteria,
  candidates: Candidate[]
): Promise<ComparisonResponse> => {
  try {
    const request: ComparisonRequest = {
      criteria,
      candidates
    };

    console.log('Making API request to:', `${API_BASE_URL}/comparison/analyze`);
    console.log('Request payload:', request);

    const response = await api.post('/comparison/analyze', request);
    console.log('API response:', response.data);
    
    return response.data.data;
  } catch (error) {
    console.error('API Error in analyzeCandidates:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      if (error.response?.status === 404) {
        throw new Error('Comparison API endpoint not found. Make sure the server is running.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw error;
  }
};

/**
 * Generate comparison report
 */
export const generateComparisonReport = async (
  comparisonId: string
): Promise<{ reportUrl: string }> => {
  const response = await api.post(`/comparison/${comparisonId}/report`);
  return response.data;
};
