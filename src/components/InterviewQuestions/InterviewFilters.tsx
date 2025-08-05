import React from 'react';
import { useInterviewStore } from '../../stores/useInterviewStore';
import SummaryStats from './SummaryStats';

interface InterviewFiltersProps {
  filteredCount: number;
  totalCount: number;
}

const InterviewFilters: React.FC<InterviewFiltersProps> = ({
  filteredCount,
  totalCount
}) => {
  // Get filter state and actions from the store
  const {
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    categories,
    difficulties
  } = useInterviewStore();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-4 sm:mb-6">
      {/* Column 1: Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
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

        <div className="flex items-end justify-start w-full sm:w-auto pt-2 sm:pt-0">
          <span className="text-sm text-gray-500">
            Showing {filteredCount} of {totalCount} questions
          </span>
        </div>
      </div>

      {/* Column 2: Summary Stats */}
      <div className="border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-6">
        <SummaryStats />
      </div>
    </div>
  );
};

export default InterviewFilters;
