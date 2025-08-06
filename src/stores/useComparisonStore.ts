import { create } from 'zustand';
import type { Candidate, CandidateComparison, ComparisonCriteria } from '../types/comparison';

interface ComparisonState {
  // Modal state
  isComparisonModalOpen: boolean;
  
  // Current comparison data
  currentComparison: CandidateComparison | null;
  candidates: Candidate[];
  comparisonCriteria: ComparisonCriteria | null;
  
  // Loading states
  isAnalyzing: boolean;
  isUploading: boolean;
  candidateLoadingStates: Record<string, boolean>;
  candidateUploadProgress: Record<string, { stage: string; progress: number }>;
  
  // Actions
  setComparisonModalOpen: (open: boolean) => void;
  setCurrentComparison: (comparison: CandidateComparison | null) => void;
  setCandidates: (candidates: Candidate[]) => void;
  addCandidate: (candidate: Candidate) => void;
  removeCandidate: (candidateId: string) => void;
  setComparisonCriteria: (criteria: ComparisonCriteria | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setIsUploading: (uploading: boolean) => void;
  setCandidateLoading: (candidateId: string, loading: boolean) => void;
  setCandidateProgress: (candidateId: string, stage: string, progress: number) => void;
  
  // Reset function
  resetComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  // Initial state
  isComparisonModalOpen: false,
  currentComparison: null,
  candidates: [],
  comparisonCriteria: null,
  isAnalyzing: false,
  isUploading: false,
  candidateLoadingStates: {},
  candidateUploadProgress: {},
  
  // Actions
  setComparisonModalOpen: (open) => set({ isComparisonModalOpen: open }),
  
  setCurrentComparison: (comparison) => set({ currentComparison: comparison }),
  
  setCandidates: (candidates) => set({ candidates }),
  
  addCandidate: (candidate) => {
    const { candidates } = get();
    set({ candidates: [...candidates, candidate] });
  },
  
  removeCandidate: (candidateId) => {
    const { candidates } = get();
    set({ candidates: candidates.filter(c => c.id !== candidateId) });
  },
  
  setComparisonCriteria: (criteria) => set({ comparisonCriteria: criteria }),
  
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  
  setCandidateLoading: (candidateId, loading) => {
    const { candidateLoadingStates } = get();
    set({ 
      candidateLoadingStates: { 
        ...candidateLoadingStates, 
        [candidateId]: loading 
      } 
    });
  },
  
  setCandidateProgress: (candidateId, stage, progress) => {
    const { candidateUploadProgress } = get();
    set({ 
      candidateUploadProgress: { 
        ...candidateUploadProgress, 
        [candidateId]: { stage, progress } 
      } 
    });
  },
  
  resetComparison: () => set({
    currentComparison: null,
    candidates: [],
    comparisonCriteria: null,
    isAnalyzing: false,
    isUploading: false,
    candidateLoadingStates: {},
    candidateUploadProgress: {},
  }),
}));
