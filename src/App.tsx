
import Layout from './components/Layout';
import Steps from './components/Steps';
import JobRequirementsForm from './components/JobRequirementsForm';
import ResumeUpload from './components/ResumeUpload';
import InterviewQuestions from './components/InterviewQuestions';
import LoadingSpinner from './components/LoadingSpinner';
import { useAppStore } from './store/useAppStore';
import { 
  uploadResume, 
  generateInterview, 
  adaptResumeToFrontend, 
  createInterviewFromBackend 
} from './services/api';
import type { JobRequirements, UploadProgress, Resume } from './types';

function App() {
  const {
    currentStep,
    jobRequirements,
    resume,
    uploadProgress,
    generatedInterview,
    isLoading,
    setCurrentStep,
    setJobRequirements,
    setResume,
    setUploadProgress,
    setGeneratedInterview,
    setIsLoading,
    resetApp
  } = useAppStore();

  const handleJobRequirementsSubmit = (requirements: Omit<JobRequirements, 'id' | 'createdAt'>) => {
    const jobReq: JobRequirements = {
      ...requirements,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setJobRequirements(jobReq);
    setCurrentStep('resume-upload');
  };

  const handleResumeUpload = async (file: File) => {
    setIsLoading(true);
    
    // Initialize upload progress
    const initialProgress: UploadProgress = {
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    };
    setUploadProgress(initialProgress);

    try {
      // Upload resume using API service
      const resumeData = await uploadResume(file, (progressPercent) => {
        const currentProgress = uploadProgress;
        if (currentProgress) {
          setUploadProgress({ ...currentProgress, progress: progressPercent });
        }
      });
      
      // Convert backend resume format to frontend format
      const resume = adaptResumeToFrontend(resumeData, file);
      setResume(resume);
      
      if (uploadProgress) {
        setUploadProgress({ ...uploadProgress, progress: 100, status: 'completed' });
      }
      setCurrentStep('generating');
      
      // Generate interview questions
      handleGenerateInterview(resume);
    } catch (error) {
      console.error('[APP] Error uploading resume:', error);
      if (uploadProgress) {
        setUploadProgress({ ...uploadProgress, status: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInterview = async (resumeParam?: Resume) => {
    
    // Use the passed resume parameter if available, otherwise fall back to state
    const resumeToUse = resumeParam || resume;
    
    if (!jobRequirements || !resumeToUse) {
      return;
    }
    
    setCurrentStep('generating');
    setIsLoading(true);

    try {
      // Generate interview questions using API service
      const interviewData = await generateInterview(jobRequirements, resumeToUse?.content || '');
      
      // Create interview object from backend data using adapter
      const interview = createInterviewFromBackend(interviewData, jobRequirements, resumeToUse);
      setGeneratedInterview(interview);
      setCurrentStep('results');
    } catch (error) {
      console.error('[APP] Error generating interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    resetApp();
  };

  const handleExport = () => {
    // In real implementation, this would generate and download a PDF
    alert('Export functionality will be implemented with backend integration.');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'job-requirements':
        return (
          <JobRequirementsForm
            onSubmit={handleJobRequirementsSubmit}
            isLoading={isLoading}
          />
        );
      
      case 'resume-upload':
        return (
          <div className="space-y-6">
            {jobRequirements && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Job Requirements Set
                </h3>
                <p className="text-sm text-blue-700">
                  {jobRequirements.title} • {jobRequirements.department} • {jobRequirements.experienceLevel} level
                </p>
              </div>
            )}
            <ResumeUpload
              onUpload={handleResumeUpload}
              uploadProgress={uploadProgress || undefined}
              isLoading={isLoading}
              uploadedResume={resume || undefined}
            />
            {resume && (
              <div className="flex justify-end">
                <button
                  onClick={() => handleGenerateInterview(resume)}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate Interview Questions
                </button>
              </div>
            )}
          </div>
        );
      
      case 'generating':
        return (
          <div className="bg-white rounded-lg shadow-md p-12">
            <LoadingSpinner 
              size="lg" 
              message="Analyzing resume and generating personalized interview questions..." 
            />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                This may take a few moments while we process your resume and create tailored questions.
              </p>
            </div>
          </div>
        );
      
      case 'results':
        return generatedInterview ? (
          <InterviewQuestions
            interview={generatedInterview}
            onStartOver={handleStartOver}
            onExport={handleExport}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Steps />
      {renderCurrentStep()}
    </Layout>
  );
}

export default App;
