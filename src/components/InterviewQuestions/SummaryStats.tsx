import React from 'react';
import { useInterviewStore } from '../../stores/useInterviewStore';

const SummaryStats: React.FC = () => {
  // Get interview data from the store
  const { interview } = useInterviewStore();
  const questions = interview?.questions || [];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">
          {questions.filter(q => q.category === 'technical').length}
        </div>
        <div className="text-sm text-gray-500">Technical</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {questions.filter(q => q.category === 'behavioral').length}
        </div>
        <div className="text-sm text-gray-500">Behavioral</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {questions.filter(q => q.category === 'situational').length}
        </div>
        <div className="text-sm text-gray-500">Situational</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">
          {questions.filter(q => q.category === 'experience').length}
        </div>
        <div className="text-sm text-gray-500">Experience</div>
      </div>
    </div>
  );
};

export default SummaryStats;
