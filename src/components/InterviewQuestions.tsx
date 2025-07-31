import React, { useEffect } from 'react';
import type { GeneratedInterview } from '../types';
import InterviewHeader from './InterviewQuestions/InterviewHeader';
import InterviewFilters from './InterviewQuestions/InterviewFilters';
import QuestionsList from './InterviewQuestions/QuestionsList';
import SummaryStats from './InterviewQuestions/SummaryStats';
import { useInterviewStore } from '../stores/useInterviewStore';

interface InterviewQuestionsProps {
  interview: GeneratedInterview;
  onStartOver: () => void;
  onExport?: () => void;
}

const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({
  interview,
  onStartOver,
  onExport
}) => {
  // Use the interview store
  const {
    setInterview,
    startOver
  } = useInterviewStore();
  
  // Set the interview in the store when the component mounts or when the interview prop changes
  useEffect(() => {
    setInterview(interview);
  }, [interview, setInterview]);
  
  // Handle start over by calling both the local callback and the store action
  const handleStartOver = () => {
    startOver();
    if (onStartOver) {
      onStartOver();
    }
  };

  // Get formatTime and questions function from the store
  const { formatTime, filteredQuestions: getFilteredQuestions } = useInterviewStore();
  
  // Get the actual filtered questions (not the function)
  const questions = getFilteredQuestions();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Header */}
      <InterviewHeader 
        interview={interview} 
        onStartOver={handleStartOver} 
        onExport={onExport} 
        formatTime={formatTime} 
      />

      {/* Filters */}
      <InterviewFilters
        filteredCount={questions.length}
        totalCount={interview.questions.length}
      />

      {/* Questions List */}
      <QuestionsList
        filteredQuestions={questions}
      />

      {/* Summary Stats */}
      <SummaryStats />
    </div>
  );
};

export default InterviewQuestions;
