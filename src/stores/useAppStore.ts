import { create } from 'zustand';
import type { JobRequirements, Resume, GeneratedInterview, UploadProgress } from '../types';

export type AppStep = 'job-requirements' | 'resume-upload' | 'generating' | 'results';

interface AppState {
  // Current step
  currentStep: AppStep;
  
  // Data
  jobRequirements: JobRequirements | null;
  resume: Resume | null;
  uploadProgress: UploadProgress | null;
  generatedInterview: GeneratedInterview | null;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setCurrentStep: (step: AppStep) => void;
  setJobRequirements: (requirements: JobRequirements | null) => void;
  setResume: (resume: Resume | null) => void;
  setUploadProgress: (progress: UploadProgress | null) => void;
  setGeneratedInterview: (interview: GeneratedInterview | null) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Reset function
  resetApp: () => void;
}

const initialState = {
  currentStep: 'job-requirements' as AppStep,
  jobRequirements: null,
  resume: null,
  uploadProgress: null,
  generatedInterview: null,
  isLoading: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setJobRequirements: (requirements) => set({ jobRequirements: requirements }),
  
  setResume: (resume) => set({ resume }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  setGeneratedInterview: (interview) => set({ generatedInterview: interview }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  resetApp: () => set(initialState),
}));
