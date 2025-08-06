import React, { useState } from 'react';
import { useComparisonStore } from '../stores/useComparisonStore';
import { uploadInterviewAssessmentPDF, analyzeCandidates } from '../services/comparisonApi';
import type { Candidate, ComparisonCriteria } from '../types/comparison';

// Skeleton loader component for candidate cards
const CandidateSkeleton: React.FC<{ stage?: string; progress?: number }> = ({ stage, progress }) => (
  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2 mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        {stage && (
          <div className="mt-3">
            <div className="text-xs text-blue-600 mb-1">{stage}</div>
            {progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="ml-2 w-4 h-4 bg-gray-300 rounded"></div>
    </div>
  </div>
);

// OCR Progress component
const OCRProgress: React.FC<{ stage: string; progress: number }> = ({ stage, progress }) => (
  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
    <div className="text-xs text-blue-800 mb-1">{stage}</div>
    <div className="w-full bg-blue-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
    <div className="text-xs text-blue-600 mt-1">{progress}%</div>
  </div>
);

const CandidateComparisonModal: React.FC = () => {
  const {
    isComparisonModalOpen,
    candidates,
    isAnalyzing,
    isUploading,
    candidateLoadingStates,
    candidateUploadProgress,
    setComparisonModalOpen,
    addCandidate,
    removeCandidate,
    setIsAnalyzing,
    setIsUploading,
    setCandidateLoading,
    setCandidateProgress,
    resetComparison
  } = useComparisonStore();

  const [dragActive, setDragActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [criteriaForm, setCriteriaForm] = useState<Partial<ComparisonCriteria>>({
    jobTitle: '',
    requiredSkills: [],
    experienceLevel: '',
    department: '',
    weightings: {
      technicalQuestions: 40,
      behavioralQuestions: 30,
      situationalQuestions: 15,
      experienceQuestions: 10,
      consistency: 5
    }
  });

  const handleClose = () => {
    setComparisonModalOpen(false);
    setShowResults(false);
    setAnalysisResults([]);
    resetComparison();
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === 'application/pdf') {
          const candidateId = `candidate-${Date.now()}-${i}`;
          
          // Set initial loading state and progress
          setCandidateLoading(candidateId, true);
          setCandidateProgress(candidateId, 'Preparing upload...', 0);
          
          // Create candidate object
          const candidate: Candidate = {
            id: candidateId,
            name: file.name.replace('.pdf', '').replace(/_/g, ' '),
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date(),
            pdfFile: file
          };
          
          // Add candidate to list immediately (as loading placeholder)
          addCandidate(candidate);
          
          try {
            // Update progress for upload
            setCandidateProgress(candidateId, 'Uploading PDF...', 20);
            
            // Upload PDF and extract interview assessment data
            const result = await uploadInterviewAssessmentPDF(file, candidateId);
            
            // Update progress for processing
            setCandidateProgress(candidateId, 'Processing PDF...', 60);
            
            candidate.interviewAssessment = result.interviewAssessment;
            
            // Extract candidate name from assessment if available
            if (result.interviewAssessment?.candidateName) {
              candidate.name = result.interviewAssessment.candidateName;
            }
            
            // Update progress for completion
            setCandidateProgress(candidateId, 'Completed', 100);
            
            // Update the candidate in the store with assessment data
            // Remove the temporary candidate and add the updated one
            removeCandidate(candidateId);
            addCandidate(candidate);
            
            console.log('Successfully processed interview assessment for:', candidate.name);
          } catch (error) {
            console.error('Error uploading PDF:', error);
            setCandidateProgress(candidateId, 'Failed to process PDF', 0);
            
            // Remove failed candidate after a delay
            setTimeout(() => {
              removeCandidate(candidateId);
            }, 3000);
            
            continue;
          } finally {
            // Clear loading state
            setCandidateLoading(candidateId, false);
          }
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAnalyzeCandidates = async () => {
    if (candidates.length < 2) {
      alert('Please upload at least 2 candidates for comparison');
      return;
    }
    
    if (!criteriaForm.jobTitle || !criteriaForm.experienceLevel) {
      alert('Please fill in the job criteria');
      return;
    }

    // Check if all candidates have interview assessment data
    const candidatesWithoutAssessment = candidates.filter(c => !c.interviewAssessment);
    if (candidatesWithoutAssessment.length > 0) {
      alert('Some candidates are still being processed. Please wait for all uploads to complete.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const criteria: ComparisonCriteria = {
        jobTitle: criteriaForm.jobTitle!,
        requiredSkills: criteriaForm.requiredSkills || [],
        experienceLevel: criteriaForm.experienceLevel!,
        department: criteriaForm.department || '',
        weightings: criteriaForm.weightings || {
          technicalQuestions: 40,
          behavioralQuestions: 30,
          situationalQuestions: 15,
          experienceQuestions: 10,
          consistency: 5
        }
      };

      console.log('Sending comparison request:', { criteria, candidates });
      const results = await analyzeCandidates(criteria, candidates);
      console.log('Analysis results:', results);
      
      setAnalysisResults(results.results);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error analyzing candidates:', error);
      
      // More detailed error message
      if (error instanceof Error) {
        alert(`Failed to analyze candidates: ${error.message}`);
      } else {
        alert('Failed to analyze candidates. Please check the console for details.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isComparisonModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Candidate Comparison
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Global Upload Loading Overlay */}
          {isUploading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <div>
                  <div className="text-sm font-medium text-blue-800">Processing PDF files...</div>
                  <div className="text-xs text-blue-600">Extracting interview assessment data using OCR</div>
                </div>
              </div>
            </div>
          )}
        
          {/* Job Criteria Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Job Criteria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  value={criteriaForm.jobTitle}
                  onChange={(e) => setCriteriaForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={criteriaForm.experienceLevel}
                  onChange={(e) => setCriteriaForm(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Interview Assessment PDFs
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload the Interview Assessment Summary PDFs to compare candidates based on their interview performance and ratings.
            </p>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isUploading ? (
                <div className="space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <div className="text-lg font-medium text-gray-700">
                    Processing PDF files...
                  </div>
                  <div className="text-sm text-gray-500">
                    Extracting interview assessment data
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-6xl text-gray-400">📄</div>
                  <div className="text-lg font-medium text-gray-700">
                    Drop Interview Assessment PDF files here or click to browse
                  </div>
                  <div className="text-sm text-gray-500">
                    Support for multiple Interview Assessment PDF files
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:bg-gray-300"
                  >
                    Select Assessment Files
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Candidates */}
          {(candidates.length > 0 || isUploading) && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Uploaded Candidates ({candidates.length})
                {isUploading && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    Processing...
                  </span>
                )}
              </h3>
              
              {/* Show skeleton loaders when uploading but no candidates yet */}
              {isUploading && candidates.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CandidateSkeleton stage="Preparing upload..." progress={0} />
                  <CandidateSkeleton stage="Initializing..." progress={0} />
                </div>
              )}
              
              {/* Show actual candidates */}
              {candidates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {candidates.map((candidate) => {
                    const isLoading = candidateLoadingStates[candidate.id];
                    const progress = candidateUploadProgress[candidate.id];
                    
                    // Show skeleton loader for loading candidates
                    if (isLoading) {
                      return (
                        <CandidateSkeleton
                          key={candidate.id}
                          stage={progress?.stage}
                          progress={progress?.progress}
                        />
                      );
                    }
                    
                    return (
                      <div
                        key={candidate.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {candidate.name}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              {candidate.fileName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatFileSize(candidate.fileSize)}
                            </p>
                            {candidate.interviewAssessment && (
                              <div className="mt-2 flex items-center text-xs text-green-600">
                                <span className="mr-1">✓</span>
                                Assessment processed
                              </div>
                            )}
                            {progress && progress.stage === 'Failed to process PDF' && (
                              <div className="mt-2 flex items-center text-xs text-red-600">
                                <span className="mr-1">✗</span>
                                {progress.stage}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeCandidate(candidate.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                            disabled={isLoading}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Analysis Results */}
          {showResults && analysisResults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comparison Results
              </h3>
              <div className="space-y-6">
                {analysisResults.map((result) => {
                  const candidate = candidates.find(c => c.id === result.candidateId);
                  if (!candidate) return null;
                  
                  return (
                    <div key={result.candidateId} className="border border-gray-200 rounded-lg p-6 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-medium text-gray-900">{candidate.name}</h4>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {result.scores.overallMatch}%
                          </div>
                          <div className="text-sm text-gray-500">Overall Match</div>
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
                          <h5 className="font-medium text-green-800 mb-2">Strengths</h5>
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
                          <h5 className="font-medium text-orange-800 mb-2">Areas for Improvement</h5>
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
                        <h5 className="font-medium text-gray-800 mb-2">Summary</h5>
                        <p className="text-sm text-gray-600">{result.scores.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            {showResults ? (
              <>
                <button
                  onClick={() => {
                    setShowResults(false);
                    setAnalysisResults([]);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Start New Comparison
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAnalyzeCandidates}
                  disabled={candidates.length < 2 || isAnalyzing || isUploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Compare Candidates'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateComparisonModal;
