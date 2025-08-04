import React from 'react';
import type { InterviewQuestion } from '../../types';
import type { InterviewQuestion as GeneratedInterviewQuestion } from '../../../server/src/types/interview';
import { useInterviewStore } from '../../stores/useInterviewStore';

interface QuestionsListProps {
  filteredQuestions: InterviewQuestion[];
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  filteredQuestions
}) => {
  // Get utility functions from the store
  const { getCategoryColor, getDifficultyColor } = useInterviewStore();
  return (
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

          <div className="md:ml-11">
            <p className="text-gray-900 text-lg leading-relaxed">
              {(question as unknown as GeneratedInterviewQuestion).text || question.question}
            </p>

            {(question as unknown as GeneratedInterviewQuestion).evaluationCriteria && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Evaluation Criteria:</h4>
                <p className="text-sm text-gray-600">{(question as unknown as GeneratedInterviewQuestion).evaluationCriteria}</p>
              </div>
            )}
          </div>


          <div className="md:ml-11">
            <div className="mt-4">
              <label htmlFor={`rating-${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Rating:
              </label>
              <select
                id={`rating-${question.id}`}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select rating</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
            <div className="mt-4">
              <label htmlFor={`comment-${question.id}`} className="block text-sm font-medium text-gray-700">
                Comments:
              </label>
              <textarea
                id={`comment-${question.id}`}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                placeholder="Add your comments here..."
              ></textarea>
            </div>

          </div>
        </div>
      ))}

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.676-6.172-1.834C5.358 12.621 5 12.173 5 11.718V7.282c0-.455.358-.903.828-1.448C7.5 4.676 9.66 4 12 4s4.5.676 6.172 1.834c.47.545.828.993.828 1.448v4.436c0 .455-.358.903-.828 1.448z" />
          </svg>
          <p className="text-gray-500">No questions match the selected filters.</p>
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
