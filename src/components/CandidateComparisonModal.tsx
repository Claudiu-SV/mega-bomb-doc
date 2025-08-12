import React, { useState, useEffect } from 'react';
import { useComparisonStore } from '../stores/useComparisonStore';
import type { CandidateGroup } from '../types/comparison';

const CandidateComparisonModal: React.FC = () => {
  const {
    isComparisonModalOpen,
    savedCandidates,
    candidateGroups,
    selectedGroup,
    selectedCandidates,
    comparisonResults,
    isAnalyzing,
    currentFilter,
    statistics,
    setComparisonModalOpen,
    loadSavedCandidates,
    selectGroup,
    toggleCandidateSelection,
    clearCandidateSelection,
    compareSelectedCandidates,
    setFilter,
    clearFilter,
    resetComparison,
  } = useComparisonStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'comparison'>('overview');

  useEffect(() => {
    if (isComparisonModalOpen) {
      loadSavedCandidates();
    }
  }, [isComparisonModalOpen, loadSavedCandidates]);

  const handleClose = () => {
    setComparisonModalOpen(false);
    resetComparison();
    setActiveTab('overview');
  };

  const handleGroupSelect = (group: CandidateGroup) => {
    selectGroup(group);
    setActiveTab('comparison');
  };

  const handleCompare = async () => {
    try {
      await compareSelectedCandidates();
    } catch (error) {
      console.error('Comparison failed:', error);
      alert(error instanceof Error ? error.message : 'Comparison failed');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!isComparisonModalOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Candidate Comparison
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Compare candidates from your saved interview assessments
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Statistics Bar */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{statistics.totalCandidates}</div>
                <div className="text-sm text-blue-800">Total Candidates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{statistics.totalGroups}</div>
                <div className="text-sm text-blue-800">Comparison Groups</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(statistics.departmentBreakdown).length}
                </div>
                <div className="text-sm text-blue-800">Departments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.keys(statistics.experienceBreakdown).length}
                </div>
                <div className="text-sm text-blue-800">Experience Levels</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview & Groups
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'comparison'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={!selectedGroup}
              >
                Comparison {selectedGroup && `(${selectedGroup.candidates.length} candidates)`}
              </button>
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* No Candidates State */}
              {savedCandidates.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl text-gray-300 mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Candidates Saved Yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Complete interview assessments and export as PDF to save candidates for comparison. 
                    Once you have candidates, they'll be grouped by experience level and department for easy comparison.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <h4 className="font-medium text-blue-900 mb-2">How to save candidates:</h4>
                    <ol className="text-sm text-blue-800 text-left space-y-1">
                      <li>1. Generate interview questions</li>
                      <li>2. Rate the questions (minimum 3 questions)</li>
                      <li>3. Export as "Text-Readable PDF"</li>
                      <li>4. Candidates are automatically saved for comparison</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Filter Options */}
              {savedCandidates.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Groups</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={clearFilter}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        Object.keys(currentFilter).length === 0
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Groups ({candidateGroups.length})
                    </button>
                    
                    {Object.entries(statistics.departmentBreakdown).map(([department, count]) => (
                      <button
                        key={department}
                        onClick={() => setFilter({ department })}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          currentFilter.department === department
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {department} ({count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Candidate Groups */}
              {candidateGroups.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Comparison Groups
                  </h3>
                  
                  {candidateGroups.map((group) => (
                    <div
                      key={group.key}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {group.experienceLevel} • {group.department}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {group.candidates.length} candidate{group.candidates.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <button
                            onClick={() => handleGroupSelect(group)}
                            disabled={group.candidates.length < 2}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                              group.candidates.length >= 2
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {group.candidates.length >= 2 ? 'Compare' : 'Need 2+ candidates'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.candidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <h5 className="font-medium text-gray-900 truncate">
                                  {candidate.name}
                                </h5>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreBgColor(candidate.scores.overallMatch)} ${getScoreColor(candidate.scores.overallMatch)}`}>
                                  {candidate.scores.overallMatch}%
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Position:</span> {candidate.jobTitle}
                                </div>
                                <div>
                                  <span className="font-medium">Questions:</span> {candidate.interviewAssessment.questionsRated}
                                </div>
                                <div>
                                  <span className="font-medium">Avg Rating:</span> {candidate.interviewAssessment.averageRating}/5.0
                                </div>
                                <div>
                                  <span className="font-medium">Date:</span> {candidate.uploadedAt.toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-500">Technical:</span>
                                    <span className={`ml-1 font-medium ${getScoreColor(candidate.scores.technicalScore)}`}>
                                      {candidate.scores.technicalScore}%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Behavioral:</span>
                                    <span className={`ml-1 font-medium ${getScoreColor(candidate.scores.behavioralScore)}`}>
                                      {candidate.scores.behavioralScore}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Comparison Tab */}
          {activeTab === 'comparison' && selectedGroup && (
            <div>
              {/* Group Header */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Comparing: {selectedGroup.experienceLevel} • {selectedGroup.department}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Select candidates to compare (minimum 2)
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Back to Groups
                  </button>
                </div>
              </div>

              {/* Candidate Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">
                    Select Candidates ({selectedCandidates.length} selected)
                  </h4>
                  {selectedCandidates.length > 0 && (
                    <button
                      onClick={clearCandidateSelection}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedGroup.candidates.map((candidate) => {
                    const isSelected = selectedCandidates.some(c => c.id === candidate.id);
                    
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => toggleCandidateSelection(candidate.id)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-medium text-gray-900">
                            {candidate.name}
                          </h5>
                          <div className="flex items-center">
                            <div className={`px-2 py-1 rounded text-xs font-medium mr-2 ${getScoreBgColor(candidate.scores.overallMatch)} ${getScoreColor(candidate.scores.overallMatch)}`}>
                              {candidate.scores.overallMatch}%
                            </div>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Rating:</span> {candidate.interviewAssessment.averageRating}/5.0
                          </div>
                          <div>
                            <span className="font-medium">Questions:</span> {candidate.interviewAssessment.questionsRated}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Compare Button */}
              {selectedCandidates.length >= 2 && (
                <div className="mb-6">
                  <button
                    onClick={handleCompare}
                    disabled={isAnalyzing}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      `Compare ${selectedCandidates.length} Candidates`
                    )}
                  </button>
                </div>
              )}

              {/* Comparison Results */}
              {comparisonResults && comparisonResults.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    Comparison Results
                  </h4>
                  
                  <div className="space-y-6">
                    {comparisonResults.map((result, index) => {
                      const candidate = selectedCandidates.find(c => c.id === result.candidateId);
                      if (!candidate) return null;
                      
                      const rankColors = ['bg-yellow-100 border-yellow-300', 'bg-gray-100 border-gray-300', 'bg-orange-100 border-orange-300'];
                      const rankColor = rankColors[index] || 'bg-gray-100 border-gray-300';
                      
                      return (
                        <div key={result.candidateId} className={`border rounded-lg p-6 ${rankColor}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center mb-2">
                                <span className="text-2xl font-bold text-gray-600 mr-3">
                                  #{result.rank}
                                </span>
                                <h5 className="text-xl font-medium text-gray-900">
                                  {candidate.name}
                                </h5>
                              </div>
                              <p className="text-gray-600">{candidate.jobTitle}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-blue-600">
                                {result.scores.overallMatch}%
                              </div>
                              <div className="text-sm text-gray-500">Overall Score</div>
                            </div>
                          </div>
                          
                          {/* Score Breakdown */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {result.scores.averageRating}%
                              </div>
                              <div className="text-sm text-gray-500">Avg Rating</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {result.scores.technicalScore}%
                              </div>
                              <div className="text-sm text-gray-500">Technical</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {result.scores.behavioralScore}%
                              </div>
                              <div className="text-sm text-gray-500">Behavioral</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {result.scores.situationalScore || 0}%
                              </div>
                              <div className="text-sm text-gray-500">Situational</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">
                                {result.scores.consistencyScore}%
                              </div>
                              <div className="text-sm text-gray-500">Consistency</div>
                            </div>
                          </div>
                          
                          {/* Strengths and Weaknesses */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h6 className="font-medium text-green-800 mb-2">Strengths</h6>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {result.scores.strengths?.map((strength: string, idx: number) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-green-500 mr-2">✓</span>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-medium text-orange-800 mb-2">Areas for Improvement</h6>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {result.scores.weaknesses?.map((weakness: string, idx: number) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="text-orange-500 mr-2">•</span>
                                    {weakness}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          
                          {/* Summary */}
                          <div>
                            <h6 className="font-medium text-gray-800 mb-2">Summary</h6>
                            <p className="text-sm text-gray-600">{result.scores.summary}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateComparisonModal;