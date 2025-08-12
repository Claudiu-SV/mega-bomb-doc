import type { SavedCandidate, CandidateGroup, ComparisonHistory } from '../types/comparison';

// localStorage keys
const STORAGE_KEYS = {
  SAVED_CANDIDATES: 'savedCandidates',
  COMPARISON_HISTORY: 'comparisonHistory',
} as const;

/**
 * Get all saved candidates from localStorage
 */
export function getSavedCandidates(): SavedCandidate[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SAVED_CANDIDATES);
    if (!saved) return [];
    
    const candidates = JSON.parse(saved);
    // Convert date strings back to Date objects
    return candidates.map((candidate: any) => ({
      ...candidate,
      uploadedAt: new Date(candidate.uploadedAt),
      lastAnalyzedAt: new Date(candidate.lastAnalyzedAt),
      interviewAssessment: {
        ...candidate.interviewAssessment,
        generatedDate: new Date(candidate.interviewAssessment.generatedDate),
      },
    }));
  } catch (error) {
    console.error('Error loading saved candidates:', error);
    return [];
  }
}

/**
 * Save a candidate to localStorage
 */
export function saveCandidate(candidate: SavedCandidate): void {
  try {
    const existing = getSavedCandidates();
    
    // Remove existing candidate with same ID if exists
    const filtered = existing.filter(c => c.id !== candidate.id);
    
    // Add the new/updated candidate
    const updated = [...filtered, candidate];
    
    localStorage.setItem(STORAGE_KEYS.SAVED_CANDIDATES, JSON.stringify(updated));
    console.log('Candidate saved successfully:', candidate.name);
  } catch (error) {
    console.error('Error saving candidate:', error);
    throw new Error('Failed to save candidate to localStorage');
  }
}

/**
 * Remove a candidate from localStorage
 */
export function removeCandidate(candidateId: string): void {
  try {
    const existing = getSavedCandidates();
    const filtered = existing.filter(c => c.id !== candidateId);
    
    localStorage.setItem(STORAGE_KEYS.SAVED_CANDIDATES, JSON.stringify(filtered));
    console.log('Candidate removed successfully:', candidateId);
  } catch (error) {
    console.error('Error removing candidate:', error);
    throw new Error('Failed to remove candidate from localStorage');
  }
}

/**
 * Group candidates by experience level and department
 */
export function groupCandidates(candidates: SavedCandidate[]): CandidateGroup[] {
  const groups = new Map<string, CandidateGroup>();
  
  candidates.forEach(candidate => {
    const key = `${candidate.experienceLevel}_${candidate.department}`.toLowerCase();
    
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        experienceLevel: candidate.experienceLevel,
        department: candidate.department,
        candidates: [],
      });
    }
    
    groups.get(key)!.candidates.push(candidate);
  });
  
  // Sort candidates within each group by average score (descending)
  groups.forEach(group => {
    group.candidates.sort((a, b) => b.scores.overallMatch - a.scores.overallMatch);
  });
  
  // Convert map to array and sort by group size (largest first)
  return Array.from(groups.values()).sort((a, b) => b.candidates.length - a.candidates.length);
}

/**
 * Get candidates for a specific experience level and department
 */
export function getCandidatesForGroup(experienceLevel: string, department: string): SavedCandidate[] {
  const allCandidates = getSavedCandidates();
  return allCandidates.filter(
    candidate => 
      candidate.experienceLevel.toLowerCase() === experienceLevel.toLowerCase() &&
      candidate.department.toLowerCase() === department.toLowerCase()
  );
}

/**
 * Save comparison history
 */
export function saveComparisonHistory(history: ComparisonHistory): void {
  try {
    const existing = getComparisonHistory();
    const filtered = existing.filter(h => h.id !== history.id);
    const updated = [...filtered, history];
    
    localStorage.setItem(STORAGE_KEYS.COMPARISON_HISTORY, JSON.stringify(updated));
    console.log('Comparison history saved:', history.id);
  } catch (error) {
    console.error('Error saving comparison history:', error);
  }
}

/**
 * Get comparison history
 */
export function getComparisonHistory(): ComparisonHistory[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPARISON_HISTORY);
    if (!saved) return [];
    
    const history = JSON.parse(saved);
    return history.map((item: any) => ({
      ...item,
      comparedAt: new Date(item.comparedAt),
    }));
  } catch (error) {
    console.error('Error loading comparison history:', error);
    return [];
  }
}

/**
 * Clear all saved data (for testing/reset)
 */
export function clearAllSavedData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVED_CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.COMPARISON_HISTORY);
    console.log('All saved data cleared');
  } catch (error) {
    console.error('Error clearing saved data:', error);
  }
}

/**
 * Get statistics about saved candidates
 */
export function getCandidateStatistics() {
  const candidates = getSavedCandidates();
  const groups = groupCandidates(candidates);
  
  return {
    totalCandidates: candidates.length,
    totalGroups: groups.length,
    departmentBreakdown: groups.reduce((acc, group) => {
      acc[group.department] = (acc[group.department] || 0) + group.candidates.length;
      return acc;
    }, {} as Record<string, number>),
    experienceBreakdown: groups.reduce((acc, group) => {
      acc[group.experienceLevel] = (acc[group.experienceLevel] || 0) + group.candidates.length;
      return acc;
    }, {} as Record<string, number>),
    lastUpdated: candidates.reduce((latest, candidate) => {
      return candidate.lastAnalyzedAt > latest ? candidate.lastAnalyzedAt : latest;
    }, new Date(0)),
  };
}
