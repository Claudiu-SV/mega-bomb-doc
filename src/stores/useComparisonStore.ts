import { create } from 'zustand';
import type { SavedCandidate, CandidateGroup } from '../types/comparison';
import { getSavedCandidates, groupCandidates, getCandidateStatistics } from '../utils/candidateStorage';

interface ComparisonState {
  // Modal state
  isComparisonModalOpen: boolean;
  
  // Persistent candidates data
  savedCandidates: SavedCandidate[];
  candidateGroups: CandidateGroup[];
  
  // Current comparison session
  selectedGroup: CandidateGroup | null;
  selectedCandidates: SavedCandidate[];
  comparisonResults: Array<{
    candidateId: string;
    rank: number;
    scores: any;
  }> | null;
  
  // UI state
  isAnalyzing: boolean;
  currentFilter: {
    department?: string;
    experienceLevel?: string;
  };
  
  // Statistics
  statistics: {
    totalCandidates: number;
    totalGroups: number;
    departmentBreakdown: Record<string, number>;
    experienceBreakdown: Record<string, number>;
    lastUpdated: Date;
  };
  
  // Actions
  setComparisonModalOpen: (open: boolean) => void;
  loadSavedCandidates: () => void;
  refreshData: () => void;
  
  // Group and candidate selection
  selectGroup: (group: CandidateGroup) => void;
  toggleCandidateSelection: (candidateId: string) => void;
  clearCandidateSelection: () => void;
  
  // Comparison actions
  compareSelectedCandidates: () => Promise<void>;
  setIsAnalyzing: (analyzing: boolean) => void;
  
  // Filtering
  setFilter: (filter: { department?: string; experienceLevel?: string }) => void;
  clearFilter: () => void;
  
  // Reset
  resetComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  // Initial state
  isComparisonModalOpen: false,
  savedCandidates: [],
  candidateGroups: [],
  selectedGroup: null,
  selectedCandidates: [],
  comparisonResults: null,
  isAnalyzing: false,
  currentFilter: {},
  statistics: {
    totalCandidates: 0,
    totalGroups: 0,
    departmentBreakdown: {},
    experienceBreakdown: {},
    lastUpdated: new Date(0),
  },
  
  // Actions
  setComparisonModalOpen: (open) => {
    set({ isComparisonModalOpen: open });
    if (open) {
      // Load data when modal opens
      get().loadSavedCandidates();
    }
  },
  
  loadSavedCandidates: () => {
    try {
      const candidates = getSavedCandidates();
      const groups = groupCandidates(candidates);
      const stats = getCandidateStatistics();
      
      set({
        savedCandidates: candidates,
        candidateGroups: groups,
        statistics: stats,
      });
      
      console.log(`Loaded ${candidates.length} candidates in ${groups.length} groups`);
    } catch (error) {
      console.error('Error loading saved candidates:', error);
    }
  },
  
  refreshData: () => {
    get().loadSavedCandidates();
  },
  
  selectGroup: (group) => {
    set({
      selectedGroup: group,
      selectedCandidates: [], // Clear previous selection
      comparisonResults: null, // Clear previous results
    });
  },
  
  toggleCandidateSelection: (candidateId) => {
    const { selectedCandidates, selectedGroup } = get();
    
    if (!selectedGroup) return;
    
    const isSelected = selectedCandidates.some(c => c.id === candidateId);
    
    if (isSelected) {
      // Remove from selection
      set({
        selectedCandidates: selectedCandidates.filter(c => c.id !== candidateId),
      });
    } else {
      // Add to selection (only from current group)
      const candidate = selectedGroup.candidates.find(c => c.id === candidateId);
      if (candidate) {
        set({
          selectedCandidates: [...selectedCandidates, candidate],
        });
      }
    }
  },
  
  clearCandidateSelection: () => {
    set({ selectedCandidates: [] });
  },
  
  compareSelectedCandidates: async () => {
    const { selectedCandidates } = get();
    
    if (selectedCandidates.length < 2) {
      throw new Error('Please select at least 2 candidates for comparison');
    }
    
    set({ isAnalyzing: true });
    
    try {
      // Sort candidates by overall score for ranking
      const sortedCandidates = [...selectedCandidates].sort(
        (a, b) => b.scores.overallMatch - a.scores.overallMatch
      );
      
      const results = sortedCandidates.map((candidate, index) => ({
        candidateId: candidate.id,
        rank: index + 1,
        scores: candidate.scores,
      }));
      
      set({ comparisonResults: results });
      
      // TODO: Save to comparison history
      console.log('Comparison completed:', results);
      
    } catch (error) {
      console.error('Error comparing candidates:', error);
      throw error;
    } finally {
      set({ isAnalyzing: false });
    }
  },
  
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  
  setFilter: (filter) => {
    const { savedCandidates } = get();
    let filteredCandidates = savedCandidates;
    
    if (filter.department) {
      filteredCandidates = filteredCandidates.filter(
        c => c.department.toLowerCase() === filter.department!.toLowerCase()
      );
    }
    
    if (filter.experienceLevel) {
      filteredCandidates = filteredCandidates.filter(
        c => c.experienceLevel.toLowerCase() === filter.experienceLevel!.toLowerCase()
      );
    }
    
    const groups = groupCandidates(filteredCandidates);
    
    set({
      currentFilter: filter,
      candidateGroups: groups,
    });
  },
  
  clearFilter: () => {
    const { savedCandidates } = get();
    const groups = groupCandidates(savedCandidates);
    
    set({
      currentFilter: {},
      candidateGroups: groups,
    });
  },
  
  resetComparison: () => set({
    selectedGroup: null,
    selectedCandidates: [],
    comparisonResults: null,
    currentFilter: {},
  }),
}));
