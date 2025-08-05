import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadResume, generateInterview, adaptResumeToFrontend, createInterviewFromBackend } from '../services/api';
import { handleError, handleSuccess } from '../lib/errorHandling';
import type { JobRequirements, Resume } from '../types';

// Upload Resume Mutation
export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => {
      const resumeData = await uploadResume(file, onProgress);
      return adaptResumeToFrontend(resumeData, file);
    },
    onSuccess: (resume: Resume) => {
      handleSuccess('Resume uploaded successfully!');
      // Cache the uploaded resume
      queryClient.setQueryData(['resume', resume.id], resume);
    },
    onError: (error) => {
      handleError(error, 'Failed to upload resume');
    },
  });
};

// Generate Interview Mutation
export const useGenerateInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      jobRequirements, 
      resumePath 
    }: { 
      jobRequirements: JobRequirements; 
      resumePath: string; 
    }) => {
      const interviewData = await generateInterview(jobRequirements, resumePath);
      return interviewData;
    },
    onSuccess: (data, variables) => {
      handleSuccess('Interview questions generated successfully!');
      // Cache the generated interview
      const cacheKey = ['interview', variables.jobRequirements.id, variables.resumePath];
      queryClient.setQueryData(cacheKey, data);
    },
    onError: (error) => {
      handleError(error, 'Failed to generate interview questions');
    },
  });
};

// Combined hook for the full interview generation flow
export const useInterviewGeneration = () => {
  const uploadMutation = useUploadResume();
  const generateMutation = useGenerateInterview();

  const generateFullInterview = async (
    file: File,
    jobRequirements: JobRequirements,
    onUploadProgress?: (progress: number) => void
  ) => {
    try {
      // Step 1: Upload resume
      const resume = await uploadMutation.mutateAsync({ 
        file, 
        onProgress: onUploadProgress 
      });

      // Step 2: Generate interview
      const interviewData = await generateMutation.mutateAsync({
        jobRequirements,
        resumePath: resume.content || ''
      });

      // Step 3: Create final interview object
      const interview = createInterviewFromBackend(interviewData, jobRequirements, resume);
      
      return { resume, interview };
    } catch (error) {
      throw error; // Re-throw to be handled by the calling component
    }
  };

  return {
    generateFullInterview,
    isUploading: uploadMutation.isPending,
    isGenerating: generateMutation.isPending,
    isLoading: uploadMutation.isPending || generateMutation.isPending,
    uploadError: uploadMutation.error,
    generateError: generateMutation.error,
    reset: () => {
      uploadMutation.reset();
      generateMutation.reset();
    }
  };
};
