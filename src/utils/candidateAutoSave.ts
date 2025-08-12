import type { GeneratedInterview, JobRequirements, Resume } from '../types';
import type { InterviewAssessment, InterviewQuestion, SavedCandidate } from '../types/comparison';

import { calculateCandidateScores } from './scoreCalculation';
import { saveCandidate } from './candidateStorage';

/**
 * Save completed interview as a candidate for comparison
 */
export function saveCandidateFromInterview(
  interview: GeneratedInterview,
  jobRequirements: JobRequirements,
  resume: Resume,
  candidateName?: string
): SavedCandidate {
  try {
    // Prefer rated questions; if none rated yet, fall back to all questions (with default rating 0)
    const ratedQuestions = interview.questions.filter(q => q.rating && q.rating > 0);
    const baseQuestions = ratedQuestions.length > 0 ? ratedQuestions : interview.questions;

    // Convert interview questions to assessment format
    const assessmentQuestions: InterviewQuestion[] = baseQuestions.map((q, index) => ({
      id: `Q${index + 1}`,
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      duration: q.suggestedTime || 5,
      rating: q.rating || 0,
      maxRating: 5,
      evaluationCriteria: q.evaluationCriteria || 'Standard evaluation criteria',
      comments: q.comment || undefined,
    }));

    // Calculate category breakdown
    const categoryBreakdown = {
      technical: assessmentQuestions.filter(q => q.category === 'technical').length,
      behavioral: assessmentQuestions.filter(q => q.category === 'behavioral').length,
      situational: assessmentQuestions.filter(q => q.category === 'situational').length,
      experience: assessmentQuestions.filter(q => q.category === 'experience').length,
    };

    // Calculate average rating (on the base questions)
    const averageRating = assessmentQuestions.length > 0
      ? assessmentQuestions.reduce((sum, q) => sum + (q.rating || 0), 0) / assessmentQuestions.length
      : 0;

    // Create interview assessment
    const interviewAssessment: InterviewAssessment = {
      candidateName: candidateName || extractCandidateNameFromResume(resume.fileName),
      jobTitle: jobRequirements.title,
      department: extractDepartmentFromTitle(jobRequirements.title),
      experienceLevel: jobRequirements.experienceLevel || 'mid',
      requiredSkills: jobRequirements.requiredSkills ? [jobRequirements.requiredSkills] : [],
      resumeFileName: resume.fileName,
      generatedDate: new Date(),
      totalQuestions: assessmentQuestions.length,
      totalDuration: assessmentQuestions.reduce((sum, q) => sum + q.duration, 0),
      questionsRated: ratedQuestions.length,
      averageRating: Math.round(averageRating * 10) / 10,
      questions: assessmentQuestions,
      categoryBreakdown,
    };

    // Calculate scores using the existing algorithm (handles zeros)
    const scores = calculateCandidateScores(interviewAssessment);

    // Create saved candidate
    const savedCandidate: SavedCandidate = {
      id: `candidate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: interviewAssessment.candidateName,
      jobTitle: jobRequirements.title,
      department: interviewAssessment.department,
      experienceLevel: interviewAssessment.experienceLevel,
      fileName: resume.fileName,
      uploadedAt: new Date(),
      interviewAssessment,
      scores,
      lastAnalyzedAt: new Date(),
    };

    // Save to localStorage
    saveCandidate(savedCandidate);

    return savedCandidate;
  } catch (error) {
    console.error('Error saving candidate:', error);
    throw new Error(`Failed to save candidate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract candidate name from resume filename
 */
function extractCandidateNameFromResume(filename: string): string {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Common patterns to clean up
  const cleanName = nameWithoutExt
    .replace(/resume|cv|_resume|_cv/gi, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanName.length > 2 && cleanName.length < 50) {
    return cleanName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  return `Candidate ${new Date().toLocaleDateString()}`;
}

function extractDepartmentFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  const departmentMappings: Record<string, string> = {
    'software engineer': 'Engineering',
    'software developer': 'Engineering',
    'frontend developer': 'Engineering',
    'backend developer': 'Engineering',
    'full stack developer': 'Engineering',
    'mobile developer': 'Engineering',
    'ios developer': 'Engineering',
    'android developer': 'Engineering',
    'devops engineer': 'Engineering',
    'data scientist': 'Data & Analytics',
    'data analyst': 'Data & Analytics',
    'data engineer': 'Data & Analytics',
    'product manager': 'Product',
    'product owner': 'Product',
    'ui designer': 'Design',
    'ux designer': 'Design',
    'ui/ux designer': 'Design',
    'marketing manager': 'Marketing',
    'digital marketer': 'Marketing',
    'sales representative': 'Sales',
    'sales manager': 'Sales',
    'hr manager': 'Human Resources',
    'recruiter': 'Human Resources',
  };

  for (const [jobTitle, department] of Object.entries(departmentMappings)) {
    if (titleLower.includes(jobTitle)) {
      return department;
    }
  }

  if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('programmer')) {
    return 'Engineering';
  }
  if (titleLower.includes('designer') || titleLower.includes('design')) {
    return 'Design';
  }
  if (titleLower.includes('manager') || titleLower.includes('lead')) {
    return 'Management';
  }
  if (titleLower.includes('analyst') || titleLower.includes('data')) {
    return 'Data & Analytics';
  }
  if (titleLower.includes('marketing') || titleLower.includes('growth')) {
    return 'Marketing';
  }
  if (titleLower.includes('sales') || titleLower.includes('business development')) {
    return 'Sales';
  }

  return 'Technology';
}

export function shouldAutoSaveCandidate(interview: GeneratedInterview): boolean {
  const ratedQuestions = interview.questions.filter(q => q.rating && q.rating > 0);
  return ratedQuestions.length >= 3;
}

export function autoSaveCandidateIfReady(
  interview: GeneratedInterview,
  jobRequirements: JobRequirements,
  resume: Resume,
  candidateName?: string,
  showDialog?: (title: string, message: string, type: 'success' | 'error' | 'warning') => void
): SavedCandidate | null {
  try {
    if (!shouldAutoSaveCandidate(interview)) {
      return null;
    }

    const savedCandidate = saveCandidateFromInterview(interview, jobRequirements, resume, candidateName);
    
    if (showDialog) {
      showDialog(
        'Candidate Saved!',
        `${savedCandidate.name} has been saved for comparison. You can now compare this candidate with others in the Candidate Comparison feature.`,
        'success'
      );
    }

    return savedCandidate;
  } catch (error) {
    console.error('Auto-save failed:', error);
    if (showDialog) {
      showDialog(
        'Save Failed',
        `Failed to save candidate: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
    return null;
  }
}
