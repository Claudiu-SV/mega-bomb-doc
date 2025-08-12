import type { JobRequirements, UploadProgress } from './types';

import CandidateComparisonModal from './components/CandidateComparisonModal';
import Dialog from './components/Dialog';
import InterviewQuestions from './components/InterviewQuestions';
import JobRequirementsForm from './components/JobRequirementsForm';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ResumeUpload from './components/ResumeUpload';
import Steps from './components/Steps';
import { exportInterviewToPDF } from './utils/pdfExport';
import { saveCandidateFromInterview } from './utils/candidateAutoSave';
import { useAppStore } from './stores/useAppStore';
import { useDialog } from './hooks/useDialog';
import { useInterviewGeneration } from './hooks/useApi';
import { useInterviewStore } from './stores/useInterviewStore';

function App() {
  const {
    currentStep,
    jobRequirements,
    resume,
    uploadProgress,
    generatedInterview,
    setCurrentStep,
    setJobRequirements,
    setResume,
    setUploadProgress,
    setGeneratedInterview,
    resetApp
  } = useAppStore();

  const interviewGeneration = useInterviewGeneration();
  const { dialog, showDialog, closeDialog } = useDialog();
  const { interview } = useInterviewStore();

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
    if (!jobRequirements) return;

    // Initialize upload progress
    const initialProgress: UploadProgress = {
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    };
    setUploadProgress(initialProgress);
    setCurrentStep('generating');

    try {
      const { resume, interview } = await interviewGeneration.generateFullInterview(
        file,
        jobRequirements,
        (progressPercent) => {
          // Update progress directly with current state
          setUploadProgress({
            fileName: file.name,
            progress: progressPercent,
            status: 'uploading'
          });
        }
      );

      // Update state with results
      setResume(resume);
      setGeneratedInterview(interview);

      // Immediately save candidate so the name appears in the Compare list
      try {
        saveCandidateFromInterview(interview, jobRequirements, resume);
      } catch (e) {
        console.warn('Candidate not saved on upload:', e);
      }

      setUploadProgress({
        fileName: file.name,
        progress: 100,
        status: 'completed'
      });
      setCurrentStep('results');
    } catch (error) {
      console.error('[APP] Error uploading resume:', error);
      // Error handling is done by React Query hooks with toast notifications
      setUploadProgress({
        fileName: file.name,
        progress: 0,
        status: 'error'
      });
      setCurrentStep('resume-upload');
    }
  };

  const handleGenerateInterview = async () => {
    if (!jobRequirements || !resume) return;
    
    setCurrentStep('generating');
    
    try {
      const { interview } = await interviewGeneration.generateFullInterview(
        new File([], resume.fileName), // Dummy file since resume is already uploaded
        jobRequirements
      );
      
      setGeneratedInterview(interview);
      setCurrentStep('results');
    } catch (error) {
      console.error('[APP] Error generating interview:', error);
      setCurrentStep('resume-upload');
    }
  };

  const handleStartOver = () => {
    // Save current interview for comparison before starting over
    if (interview && jobRequirements && resume) {
      try {
        saveCandidateFromInterview(interview, jobRequirements, resume);
        showDialog('Interview Saved', 'Current interview has been saved for comparison before starting over.', 'success');
        console.log('✅ Interview saved before starting over');
      } catch (error) {
        console.error('Failed to save interview before starting over:', error);
        showDialog('Save Failed', 'Could not save interview for comparison, but you can continue.', 'warning');
      }
    }
    resetApp();
  };

  const handleExport = (type: 'image-based' | 'text-based' | 'save' = 'image-based') => {
    if (interview && jobRequirements && resume) {
      if (type === 'save') {
        // Just save the candidate without generating PDF
        try {
          saveCandidateFromInterview(interview, jobRequirements, resume);
          showDialog('Candidate Saved', 'Candidate assessment has been saved for comparison.', 'success');
          console.log('✅ Candidate saved for comparison');
        } catch (error) {
          console.error('Failed to save candidate:', error);
          showDialog('Save Failed', 'Failed to save candidate for comparison. Please try again.', 'error');
        }
      } else {
        // Export PDF (revert to original functionality)
        const useTextBasedPDF = type === 'text-based';
        exportInterviewToPDF(interview, showDialog, useTextBasedPDF);
      }
    }
  };

  const handlePreview = () => {
    if (interview) {
      exportInterviewToPDF(interview, showDialog, true);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'job-requirements':
        return (
          <JobRequirementsForm
            onSubmit={handleJobRequirementsSubmit}
            isLoading={interviewGeneration.isLoading}
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
              isLoading={interviewGeneration.isLoading}
              uploadedResume={resume || undefined}
            />
            {resume && (
              <div className="flex justify-end">
                <button
                  onClick={handleGenerateInterview}
                  disabled={interviewGeneration.isLoading}
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
            onPreview={handlePreview}            />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <Layout>
      <Steps />
      {renderCurrentStep()}
      
      {/* Global Dialog */}
      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={closeDialog}
      />
      <CandidateComparisonModal />
    </Layout>
  );
}

export default App;
