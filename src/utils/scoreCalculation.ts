import type { InterviewAssessment, CandidateScores } from '../types/comparison';

/**
 * Calculate scores based on interview assessment (client-side version)
 */
export function calculateCandidateScores(assessment: InterviewAssessment): CandidateScores {
  const questions = assessment.questions;
  
  if (questions.length === 0) {
    throw new Error('No questions found in assessment');
  }

  // Calculate category scores (convert to percentage scale)
  const technicalQuestions = questions.filter(q => q.category === 'technical');
  const behavioralQuestions = questions.filter(q => q.category === 'behavioral');
  const situationalQuestions = questions.filter(q => q.category === 'situational');
  const experienceQuestions = questions.filter(q => q.category === 'experience');

  // Calculate average ratings for each category (1-5 scale) then convert to percentage
  const technicalScore = technicalQuestions.length > 0 
    ? Math.round((technicalQuestions.reduce((sum, q) => sum + q.rating, 0) / technicalQuestions.length / 5) * 100)
    : 0;

  const behavioralScore = behavioralQuestions.length > 0
    ? Math.round((behavioralQuestions.reduce((sum, q) => sum + q.rating, 0) / behavioralQuestions.length / 5) * 100)
    : 0;

  const situationalScore = situationalQuestions.length > 0
    ? Math.round((situationalQuestions.reduce((sum, q) => sum + q.rating, 0) / situationalQuestions.length / 5) * 100)
    : 0;

  const experienceScore = experienceQuestions.length > 0
    ? Math.round((experienceQuestions.reduce((sum, q) => sum + q.rating, 0) / experienceQuestions.length / 5) * 100)
    : 0;

  // Calculate consistency (how consistent are the ratings)
  const ratings = questions.map(q => q.rating);
  const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length;
  const consistencyScore = Math.max(0, 100 - (variance * 20)); // Lower variance = higher consistency

  // Overall match (weighted average of categories that have questions)
  const categoriesWithQuestions = [];
  if (technicalQuestions.length > 0) categoriesWithQuestions.push(technicalScore);
  if (behavioralQuestions.length > 0) categoriesWithQuestions.push(behavioralScore);
  if (situationalQuestions.length > 0) categoriesWithQuestions.push(situationalScore);
  if (experienceQuestions.length > 0) categoriesWithQuestions.push(experienceScore);
  categoriesWithQuestions.push(consistencyScore); // Always include consistency
  
  const overallMatch = categoriesWithQuestions.length > 0
    ? Math.round(categoriesWithQuestions.reduce((sum, score) => sum + score, 0) / categoriesWithQuestions.length)
    : 0;

  // Identify strengths and weaknesses
  const highPerformance = questions.filter(q => q.rating >= 4);
  const lowPerformance = questions.filter(q => q.rating <= 2);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (technicalScore >= 80) strengths.push('Strong technical performance');
  if (behavioralScore >= 80) strengths.push('Excellent behavioral responses');
  if (situationalScore >= 80) strengths.push('Great situational judgment');
  if (experienceScore >= 80) strengths.push('Relevant experience');
  if (consistencyScore >= 80) strengths.push('Consistent performance across questions');

  if (technicalScore < 60) weaknesses.push('Technical skills need improvement');
  if (behavioralScore < 60) weaknesses.push('Behavioral responses could be stronger');
  if (situationalScore < 60) weaknesses.push('Situational judgment needs work');
  if (experienceScore < 60) weaknesses.push('Limited relevant experience demonstrated');
  if (consistencyScore < 60) weaknesses.push('Inconsistent performance across questions');

  const summary = `Candidate achieved an average rating of ${avgRating.toFixed(1)}/5.0 across ${questions.length} questions. 
    ${highPerformance.length > 0 ? `Performed well on ${highPerformance.length} questions.` : ''} 
    ${lowPerformance.length > 0 ? `Needs improvement on ${lowPerformance.length} questions.` : ''}`.trim();

  return {
    overallMatch: isNaN(overallMatch) ? 0 : overallMatch,
    technicalScore: isNaN(technicalScore) ? 0 : technicalScore,
    behavioralScore: isNaN(behavioralScore) ? 0 : behavioralScore,
    situationalScore: isNaN(situationalScore) ? 0 : situationalScore,
    experienceScore: isNaN(experienceScore) ? 0 : experienceScore,
    consistencyScore: isNaN(consistencyScore) ? 0 : Math.round(consistencyScore),
    averageRating: isNaN(avgRating) ? 0 : Math.round(avgRating * 20), // Convert to 0-100 scale
    strengths,
    weaknesses,
    summary,
    questionBreakdown: {
      highPerformance,
      lowPerformance
    }
  };
}
