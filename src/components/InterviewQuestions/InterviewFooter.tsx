import type { InterviewAssessment, SavedCandidate } from '../../types/comparison';

import { calculateCandidateScores } from '../../utils/scoreCalculation';
import { saveCandidate } from '../../utils/candidateStorage';
import { useDialog } from '../../hooks/useDialog';
import { useInterviewStore } from '../../stores/useInterviewStore';

interface InterviewFooterProps {
  onStartOver: () => void;
  onExport?: () => void;
  onPreview?: () => void;
}

function InterviewFooter({
  onStartOver,
  onExport,
  onPreview
}: InterviewFooterProps) {
  // Get live interview data from the store to check for ratings
  const { interview } = useInterviewStore();
  const { showDialog } = useDialog();

  if (!interview) {
    return null;
  }

  const hasRatedQuestions = interview.questions.some(q => q.rating && q.rating > 0);

  // Function to save current progress
  const saveProgress = async (showSuccessMessage = true) => {
    try {
      if (!interview) {
        throw new Error('No interview data available');
      }

      // Convert GeneratedInterview to InterviewAssessment
      const assessment: InterviewAssessment = {
        candidateName: `Candidate_${Date.now()}`, // Default name, can be improved
        jobTitle: interview.jobRequirements.title,
        department: interview.jobRequirements.department,
        experienceLevel: interview.jobRequirements.experienceLevel,
        requiredSkills: interview.jobRequirements.requiredSkills.split(',').map(s => s.trim()),
        resumeFileName: 'uploaded_resume.pdf', // Default, can be improved
        generatedDate: new Date(),
        totalQuestions: interview.questions.length,
        totalDuration: interview.totalEstimatedTime,
        questionsRated: interview.questions.filter(q => q.rating && q.rating > 0).length,
        averageRating: interview.questions.filter(q => q.rating && q.rating > 0)
          .reduce((sum, q) => sum + (q.rating || 0), 0) / Math.max(1, interview.questions.filter(q => q.rating && q.rating > 0).length),
        questions: interview.questions.map(q => ({
          id: q.id,
          question: q.question,
          category: q.category as 'technical' | 'behavioral' | 'situational' | 'experience',
          difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
          duration: q.suggestedTime,
          rating: q.rating || 0,
          maxRating: 5,
          comments: q.comment || '',
          evaluationCriteria: q.evaluationCriteria || ''
        })),
        categoryBreakdown: {
          technical: interview.questions.filter(q => q.category === 'technical').length,
          behavioral: interview.questions.filter(q => q.category === 'behavioral').length,
          situational: interview.questions.filter(q => q.category === 'situational').length,
          experience: interview.questions.filter(q => q.category === 'experience').length,
        }
      };

      // Calculate scores
      const scores = calculateCandidateScores(assessment);

      // Create SavedCandidate
      const savedCandidate: SavedCandidate = {
        id: `candidate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: assessment.candidateName,
        jobTitle: assessment.jobTitle,
        department: assessment.department,
        experienceLevel: assessment.experienceLevel,
        fileName: assessment.resumeFileName,
        uploadedAt: new Date(),
        interviewAssessment: assessment,
        scores: scores,
        lastAnalyzedAt: new Date()
      };

      // Save to localStorage
      saveCandidate(savedCandidate);

      if (showSuccessMessage && showDialog) {
        showDialog('Progress Saved', 'Your interview progress has been saved successfully!', 'success');
      }

      return savedCandidate;
    } catch (error) {
      console.error('Error saving progress:', error);
      if (showDialog) {
        showDialog('Save Error', 'Failed to save progress. Please try again.', 'error');
      }
      throw error;
    }
  };

  // Enhanced handlers that save progress
  const handleStartOver = async () => {
    try {
      if (hasRatedQuestions) {
        await saveProgress(false); // Save silently before starting over
      }
      onStartOver();
    } catch (error) {
      console.error('Error starting over:', error);
      // Still proceed with start over even if save fails
      onStartOver();
    }
  };

  const handleExport = async () => {
    try {
      if (hasRatedQuestions) {
        await saveProgress(false); // Save silently before export
      }
      if (onExport) {
        onExport();
      }
    } catch (error) {
      console.error('Error exporting:', error);
      // Still proceed with export even if save fails
      if (onExport) {
        onExport();
      }
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4 sm:pt-6 mt-6 sm:mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-600">Finished reviewing? Save your progress, export your results or start over.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
          <button
            onClick={handleStartOver}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
          >
            Start Over
          </button>
          {onPreview && (
            <button
              onClick={onPreview}
              disabled={!hasRatedQuestions}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Preview PDF
            </button>
          )}
          {onExport && (
            <button
              onClick={handleExport}
              disabled={!hasRatedQuestions}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Export PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewFooter;
