
import Layout from './components/Layout';
import Steps from './components/Steps';
import JobRequirementsForm from './components/JobRequirementsForm';
import ResumeUpload from './components/ResumeUpload';
import InterviewQuestions from './components/InterviewQuestions';
import LoadingSpinner from './components/LoadingSpinner';
import { useAppStore } from './store/useAppStore';
import type { JobRequirements, Resume, GeneratedInterview, UploadProgress } from './types';

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
    
    // Simulate upload progress
    const progress: UploadProgress = {
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    };
    setUploadProgress(progress);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress({
        fileName: file.name,
        progress: Math.min((uploadProgress?.progress || 0) + 10, 100),
        status: (uploadProgress?.progress || 0) + 10 >= 100 ? 'completed' : 'uploading'
      });
    }, 200);

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(progressInterval);
      const uploadedResume: Resume = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date()
      };
      setResume(uploadedResume);
      setUploadProgress(null);
      setIsLoading(false);
    }, 2500);
  };

  const handleGenerateQuestions = async () => {
    if (!jobRequirements || !resume) return;
    
    setCurrentStep('generating');
    setIsLoading(true);

    // Simulate API call to generate questions
    // In real implementation, this would call the backend API
    setTimeout(() => {
      const mockQuestions = [
        {
          id: '1',
          question: 'Can you walk me through your experience with React and TypeScript? How have you used these technologies in your previous projects?',
          category: 'technical' as const,
          difficulty: 'medium' as const,
          suggestedTime: 5
        },
        {
          id: '2',
          question: 'Describe a challenging technical problem you solved recently. What was your approach and what did you learn from it?',
          category: 'behavioral' as const,
          difficulty: 'medium' as const,
          suggestedTime: 8
        },
        {
          id: '3',
          question: 'How would you handle a situation where you disagree with a technical decision made by your team lead?',
          category: 'situational' as const,
          difficulty: 'medium' as const,
          suggestedTime: 6
        },
        {
          id: '4',
          question: 'What specific experience do you have with Node.js and Express.js? Can you describe a project where you used these technologies?',
          category: 'experience' as const,
          difficulty: 'easy' as const,
          suggestedTime: 4
        },
        {
          id: '5',
          question: 'Explain the concept of closures in JavaScript and provide a practical example of when you might use them.',
          category: 'technical' as const,
          difficulty: 'hard' as const,
          suggestedTime: 10
        }
      ];

      const interview: GeneratedInterview = {
        id: Date.now().toString(),
        jobRequirements,
        resume,
        questions: mockQuestions,
        generatedAt: new Date(),
        totalEstimatedTime: mockQuestions.reduce((total, q) => total + q.suggestedTime, 0)
      };

      setGeneratedInterview(interview);
      setCurrentStep('results');
      setIsLoading(false);
    }, 3000);
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
                  onClick={handleGenerateQuestions}
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
