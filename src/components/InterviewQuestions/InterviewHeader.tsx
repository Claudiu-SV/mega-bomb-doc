import React from 'react';
import type { GeneratedInterview } from '../../types';
import { useInterviewStore } from '../../stores/useInterviewStore';

interface InterviewHeaderProps {
  interview: GeneratedInterview;
  onStartOver: () => void;
  onExport?: () => void;
  formatTime: (minutes: number) => string;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  interview,
  onStartOver,
  onExport
}) => {
  // Get formatTime from the store
  const { formatTime } = useInterviewStore();
  return (
    <div className="border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Interview Questions Generated
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
            For {interview.jobRequirements.title} • {interview.questions.length} questions • 
            Estimated time: {formatTime(interview.totalEstimatedTime)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 sm:px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Export PDF
            </button>
          )}
          <button
            onClick={onStartOver}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewHeader;
