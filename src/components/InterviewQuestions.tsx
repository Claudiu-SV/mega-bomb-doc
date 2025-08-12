import React, { useEffect, useState } from 'react';

import type { GeneratedInterview } from '../types';
import InterviewFilters from './InterviewQuestions/InterviewFilters';
import InterviewFooter from './InterviewQuestions/InterviewFooter';
import InterviewHeader from './InterviewQuestions/InterviewHeader';
import QuestionsList from './InterviewQuestions/QuestionsList';
import { useInterviewStore } from '../stores/useInterviewStore';

interface InterviewQuestionsProps {
  interview: GeneratedInterview;
  onStartOver: () => void;
  onExport?: () => void;
  onPreview?: () => void;
}

const InterviewQuestions: React.FC<InterviewQuestionsProps> = ({
  interview,
  onStartOver,
  onExport,
  onPreview
}) => {
  // Use the interview store
  const {
    setInterview,
    startOver,
    filteredQuestions: getFilteredQuestions
  } = useInterviewStore();

  const [showScrollButtons, setShowScrollButtons] = useState(false);
  
  // Set the interview in the store when the component mounts or when the interview prop changes
  useEffect(() => {
    setInterview(interview);
  }, [interview, setInterview]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 200;
      setShowScrollButtons(isScrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle start over by calling both the local callback and the store action
  const handleStartOver = () => {
    startOver();
    if (onStartOver) {
      onStartOver();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToEnd = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  // Get the actual filtered questions (not the function)
  const questions = getFilteredQuestions();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Header */}
      <InterviewHeader interview={interview} />

      {/* Filters */}
      <InterviewFilters
        filteredCount={questions.length}
        totalCount={interview.questions.length}
      />

      {/* Questions List */}
      <QuestionsList
        filteredQuestions={questions}
      />

      {/* Footer */}
      <InterviewFooter
        onStartOver={handleStartOver} 
        onExport={onExport}
        onPreview={onPreview}
      />
      {/* Floating Scroll Buttons */}
      {showScrollButtons && (
        <div className="hidden sm:flex fixed bottom-8 right-8 flex-col gap-3 z-20">
          <button
            onClick={scrollToTop}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1-0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1-0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={scrollToEnd}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Scroll to end"
            title="Scroll to end"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewQuestions;