import { create } from 'zustand';
import type { GeneratedInterview, InterviewQuestion } from '../types';
import { formatTime, getCategoryColor, getDifficultyColor } from '../utils/interviewUtils';

interface InterviewStore {
  // Data
  interview: GeneratedInterview | null;
  
  // Filter state
  selectedCategory: string;
  selectedDifficulty: string;
  categories: string[];
  difficulties: string[];
  
  // Computed values
  filteredQuestions: () => InterviewQuestion[];
  
  // Actions
  setSelectedCategory: (category: string) => void;
  setSelectedDifficulty: (difficulty: string) => void;
  setInterview: (interview: GeneratedInterview) => void;
  startOver: () => void;
  
  // Utility functions (re-exported from utils)
  formatTime: typeof formatTime;
  getCategoryColor: typeof getCategoryColor;
  getDifficultyColor: typeof getDifficultyColor;
}

export const useInterviewStore = create<InterviewStore>((set, get) => ({
  // Initial data
  interview: null,
  
  // Initial filter state
  selectedCategory: 'all',
  selectedDifficulty: 'all',
  categories: ['all', 'technical', 'behavioral', 'situational', 'experience'],
  difficulties: ['all', 'easy', 'medium', 'hard'],
  
  // Computed values
  filteredQuestions: () => {
    const { interview, selectedCategory, selectedDifficulty } = get();
    
    if (!interview) return [];
    
    return interview.questions.filter(question => {
      const categoryMatch = selectedCategory === 'all' || question.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
      return categoryMatch && difficultyMatch;
    });
  },
  
  // Actions
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),
  setSelectedDifficulty: (difficulty: string) => set({ selectedDifficulty: difficulty }),
  setInterview: (interview: GeneratedInterview) => set({ interview }),
  startOver: () => set({ interview: null }),
  
  // Utility functions imported from utils
  formatTime,
  getCategoryColor,
  getDifficultyColor
}));
