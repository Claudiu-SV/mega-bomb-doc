import React from 'react';
import type { GeneratedInterview } from '../../types';
import { useInterviewStore } from '../../stores/useInterviewStore';

interface InterviewHeaderProps {
  interview: GeneratedInterview;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  interview,
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
        <div className="flex flex-col items-end gap-2 text-right flex-shrink-0 sm:max-w-sm">
          <div className="flex flex-wrap gap-2 justify-end">
            <span className="px-3 py-1 text-xs font-medium text-indigo-800 bg-indigo-100 rounded-full">
              {interview.jobRequirements.department}
            </span>
            <span className="px-3 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full capitalize">
              {interview.jobRequirements.experienceLevel} Level
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate" title={interview.jobRequirements.requiredSkills}>
            <strong>Skills:</strong> {interview.jobRequirements.requiredSkills}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewHeader;