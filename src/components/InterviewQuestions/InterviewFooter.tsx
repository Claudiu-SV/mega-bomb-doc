import React from 'react';
import { useInterviewStore } from '../../stores/useInterviewStore';

interface InterviewFooterProps {
  onStartOver: () => void;
  onExport?: () => void;
}

const InterviewFooter: React.FC<InterviewFooterProps> = ({
  onStartOver,
  onExport
}) => {
  // Get live interview data from the store to check for ratings
  const { interview } = useInterviewStore();

  if (!interview) {
    return null;
  }

  const hasRatedQuestions = interview.questions.some(q => q.rating && q.rating > 0);

  return (
    <div className="border-t border-gray-200 pt-4 sm:pt-6 mt-6 sm:mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-600">Finished reviewing? Export your results or start over.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={onStartOver}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
          >
            Start Over
          </button>
          {onExport && (
            <button
              onClick={onExport}
              disabled={!hasRatedQuestions}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Finish & Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewFooter;
