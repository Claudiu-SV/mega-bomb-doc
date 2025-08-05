import type { InterviewQuestion } from '../../types';
import React, { useState } from 'react';
import { useInterviewStore } from '../../stores/useInterviewStore';

interface QuestionsListProps {
  filteredQuestions: InterviewQuestion[];
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  filteredQuestions
}) => {
  const [hoveredRatings, setHoveredRatings] = useState<Record<string, number>>({});
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const { getCategoryColor, getDifficultyColor, updateQuestionRating, updateQuestionComment } = useInterviewStore();

  // Calculate total rating (average of all rated questions)
  const calculateTotalRating = () => {
    const ratedQuestions = filteredQuestions.filter(question => question.rating && question.rating > 0);
    if (ratedQuestions.length === 0) return null;
    
    const totalRating = ratedQuestions.reduce((sum, question) => sum + question.rating, 0);
    return {
      average: totalRating / ratedQuestions.length,
      count: ratedQuestions.length,
      total: filteredQuestions.length
    };
  };

  const totalRating = calculateTotalRating();

  return (
    <div className="space-y-4 sm:space-y-6">
      {filteredQuestions.map((question, index) => (
        <div
          key={question.id}
          className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
            <div className="flex items-start gap-3 md:flex-col md:items-center md:gap-2 md:w-20 flex-shrink-0">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                Q{index + 1}
              </div>
              <div className="flex gap-2 md:flex-col md:gap-1 md:items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                  {question.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="mb-2 text-sm text-gray-500">
                Estimated time: {question.suggestedTime}m
              </div>

              <p className="text-gray-900 text-lg leading-relaxed mb-4">
                {question.question}
              </p>

              {question.evaluationCriteria && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-100 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Evaluation Criteria:</h4>
                  <p className="text-sm text-gray-600">{question.evaluationCriteria}</p>
                </div>
              )}

              {/* Assessment Section */}
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {/* Rating */}
                  <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3">Your Assessment</h4>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Candidate Rating
                    </label>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex"
                        onMouseLeave={() => setHoveredRatings(prev => ({ ...prev, [question.id]: 0 }))}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`text-3xl transition-all duration-150 ease-in-out transform hover:scale-125 focus:outline-none ${
                              (hoveredRatings[question.id] || question.rating || 0) >= star
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => updateQuestionRating(question.id, star === question.rating ? 0 : star)}
                            onMouseEnter={() => setHoveredRatings(prev => ({ ...prev, [question.id]: star }))}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 font-medium w-28 h-6">
                        {ratingLabels[hoveredRatings[question.id] || question.rating || 0]}
                      </span>
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <label htmlFor={`comment-${question.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Comments
                    </label>
                    <textarea
                      id={`comment-${question.id}`}
                      rows={3}
                      value={question.comment || ''}
                      onChange={(e) => updateQuestionComment(question.id, e.target.value)}
                      className="block w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 transition-shadow focus:shadow-lg"
                      placeholder="Strengths, weaknesses, examples..."
                    />
                  </div>
                </div>
              </div>
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

      {/* Total Rating Summary */}
      {filteredQuestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Interview Assessment Summary</h3>
                <p className="text-sm text-blue-700">
                  {totalRating ? `${totalRating.count} of ${totalRating.total} questions rated` : `0 of ${filteredQuestions.length} questions rated`}
                </p>
              </div>
            </div>
            
            <div className="text-center sm:text-right">
              {totalRating ? (
                <>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {totalRating.average.toFixed(1)}/5.0
                  </div>
                  <div className="flex justify-center sm:justify-end items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(totalRating.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    Average Rating
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  <div className="text-xl font-semibold mb-1">No Ratings Yet</div>
                  <div className="text-sm">Rate questions to see summary</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
