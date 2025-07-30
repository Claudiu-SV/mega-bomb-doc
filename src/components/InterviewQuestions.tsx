import React, { useState } from 'react';
import type { GeneratedInterview } from '../types';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = ['all', 'technical', 'behavioral', 'situational', 'experience'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const filteredQuestions = interview.questions.filter(question => {
    const categoryMatch = selectedCategory === 'all' || question.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      behavioral: 'bg-green-100 text-green-800',
      situational: 'bg-yellow-100 text-yellow-800',
      experience: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Header */}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0 sm:flex-initial">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-0 sm:flex-initial">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-center sm:justify-start">
          <span className="text-xs sm:text-sm text-gray-500">
            Showing {filteredQuestions.length} of {interview.questions.length} questions
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.map((question, index) => (
          <div
            key={question.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                    {question.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {question.suggestedTime}m
              </div>
            </div>

            <div className="ml-11">
              <p className="text-gray-900 text-lg leading-relaxed">
                {question.question}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.676-6.172-1.834C5.358 12.621 5 12.173 5 11.718V7.282c0-.455.358-.903.828-1.448C7.5 4.676 9.66 4 12 4s4.5.676 6.172 1.834c.47.545.828.993.828 1.448v4.436c0 .455-.358.903-.828 1.448z" />
          </svg>
          <p className="text-gray-500">No questions match the selected filters.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {interview.questions.filter(q => q.category === 'technical').length}
            </div>
            <div className="text-sm text-gray-500">Technical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {interview.questions.filter(q => q.category === 'behavioral').length}
            </div>
            <div className="text-sm text-gray-500">Behavioral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {interview.questions.filter(q => q.category === 'situational').length}
            </div>
            <div className="text-sm text-gray-500">Situational</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {interview.questions.filter(q => q.category === 'experience').length}
            </div>
            <div className="text-sm text-gray-500">Experience</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestions;
