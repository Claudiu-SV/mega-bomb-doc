import React from 'react';
import { useAppStore } from '../store/useAppStore';

const Steps: React.FC = () => {
  const currentStep = useAppStore((state) => state.currentStep);

  const steps = [
    { key: 'job-requirements', label: 'Job Requirements', number: 1, shortLabel: 'Job' },
    { key: 'resume-upload', label: 'Resume Upload', number: 2, shortLabel: 'Resume' },
    { key: 'generating', label: 'Generating', number: 3, shortLabel: 'AI' },
    { key: 'results', label: 'Results', number: 4, shortLabel: 'Results' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile Progress Bar */}
      <div className="block sm:hidden mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span className="font-medium">{steps[currentStepIndex]?.label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Indicators */}
      <div className="hidden sm:flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = step.key === currentStep;
          const isCompleted = currentStepIndex > index;
          
          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  isCompleted 
                    ? 'bg-green-500 text-white'
                    : isActive 
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <span className="hidden lg:inline">{step.label}</span>
                  <span className="lg:hidden">{step.shortLabel}</span>
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`mx-3 lg:mx-4 h-0.5 w-8 lg:w-12 transition-colors ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Steps;
