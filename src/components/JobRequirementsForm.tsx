import type { JobRequirements, JobRequirementsFavorite } from '../types';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobRequirementsSchema, type JobRequirementsFormData } from '../schemas/jobRequirementsSchema';
import { itJobs } from '../data/itJobs';

interface JobRequirementsFormProps {
  onSubmit: (requirements: Omit<JobRequirements, 'id' | 'createdAt'>) => void;
  isLoading?: boolean;
}

const JobRequirementsForm: React.FC<JobRequirementsFormProps> = ({
  onSubmit, 
  isLoading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue
  } = useForm<JobRequirementsFormData>({
    resolver: zodResolver(jobRequirementsSchema),
    defaultValues: {
      title: '',
      description: '',
      requiredSkills: '',
      experienceLevel: 'entry',
      department: ''
    },
    mode: 'onChange'
  });

  const watchedValues = watch();

  const [favorites, setFavorites] = useState<JobRequirementsFavorite[]>([]);
  const [dialog, setDialog] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Check if all mandatory fields are filled
  const isSaveDisabled = !isValid || !watchedValues.title?.trim() || !watchedValues.department?.trim() || 
    !watchedValues.experienceLevel || !watchedValues.requiredSkills?.trim() || !watchedValues.description?.trim();

  // Check if any field has content (for Clear button)
  const isClearDisabled = !watchedValues.title?.trim() && !watchedValues.department?.trim() && 
    !watchedValues.experienceLevel && !watchedValues.requiredSkills?.trim() && !watchedValues.description?.trim();

  // Helper function to show dialog
  const showDialog = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setDialog({ isOpen: true, title, message, type });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('jobRequirementsFavorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavorites(parsedFavorites);
      } catch (error) {
        console.error('Failed to load favorites from localStorage:', error);
      }
    }
  }, []);

  const onFormSubmit = (data: JobRequirementsFormData) => {
    const requirements = {
      ...data,
      requiredSkills: data.requiredSkills.trim()
    };
    
    onSubmit(requirements);
  };

  // No longer needed as React Hook Form handles input changes

  const handleSaveAsFavorite = () => {
    if (!watchedValues.title?.trim()) {
      showDialog('Missing Information', 'Please enter a job title before saving as favorite.', 'warning');
      return;
    }

    // Check for duplicate titles (case-insensitive)
    const titleExists = favorites.some(
      favorite => favorite.title.toLowerCase() === watchedValues.title!.trim().toLowerCase()
    );

    if (titleExists) {
      showDialog('Duplicate Title', 'A favorite with this job title already exists. Please use a different title.', 'warning');
      return;
    }

    const newFavorite: JobRequirementsFavorite = {
      id: Date.now().toString(),
      title: watchedValues.title,
      description: watchedValues.description,
      requiredSkills: watchedValues.requiredSkills
        .split(',')
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill.length > 0)
        .join(', '),
      experienceLevel: watchedValues.experienceLevel,
      department: watchedValues.department,
      savedAt: new Date()
    };

    const updatedFavorites = [...favorites, newFavorite];
    setFavorites(updatedFavorites);
    
    try {
      localStorage.setItem('jobRequirementsFavorites', JSON.stringify(updatedFavorites));
      showDialog('Success!', 'Job requirements saved as favorite!', 'success');
    } catch (error) {
      console.error('Failed to save favorite to localStorage:', error);
      showDialog('Error', 'Failed to save favorite. Please try again.', 'error');
    }
  };

  const handleLoadFavorite = (favorite: JobRequirementsFavorite) => {
    setValue('title', favorite.title);
    setValue('description', favorite.description);
    setValue('requiredSkills', favorite.requiredSkills);
    setValue('experienceLevel', favorite.experienceLevel as 'entry' | 'mid' | 'senior' | 'executive');
    setValue('department', favorite.department);
  };

  const handleDeleteFavorite = (favoriteId: string) => {
    const updatedFavorites = favorites.filter(fav => fav.id !== favoriteId);
    setFavorites(updatedFavorites);
    
    try {
      localStorage.setItem('jobRequirementsFavorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Failed to update favorites in localStorage:', error);
    }
  };

  const handleJobTitleSelect = (selectedTitle: string) => {
    setValue('title', selectedTitle);
    
    // Find the corresponding job description and auto-fill it
    const selectedJob = itJobs.find(job => job.title === selectedTitle);
    if (selectedJob) {
      setValue('description', selectedJob.description);
    }
  };

  const handleClear = () => {
    reset({
      title: '',
      description: '',
      requiredSkills: '',
      experienceLevel: 'entry',
      department: ''
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
          Job Requirements
        </h2>

      {/* Saved Favorites */}
      {favorites.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-4">Saved Favorites</h3>
          <div className="flex flex-wrap gap-3">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative group">
                <button
                  type="button"
                  onClick={() => handleLoadFavorite(favorite)}
                  className="inline-flex items-center pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                  title={`Load: ${favorite.title}`}
                >
                  {favorite.title}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFavorite(favorite.id);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                  title="Delete favorite"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
          <div className="md:col-span-3">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <div className="space-y-3">
              {/* Dropdown for predefined IT jobs */}
              <select
                id="jobTitleSelect"
                value={itJobs.find(job => job.title === watchedValues.title)?.title || ''}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  if (selectedValue) {
                    handleJobTitleSelect(selectedValue);
                  }
                }}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                {itJobs.map((job) => (
                  <option key={job.title} value={job.title}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <input
              type="text"
              id="department"
              {...register('department')}
              className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.department ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Engineering, Marketing, Sales"
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
            )}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Experience Level *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { value: 'entry', label: 'Entry Level', subtitle: '0-2 years', icon: '🌱' },
              { value: 'mid', label: 'Mid Level', subtitle: '3-5 years', icon: '🚀' },
              { value: 'senior', label: 'Senior Level', subtitle: '6-10 years', icon: '⭐' },
              { value: 'executive', label: 'Executive Level', subtitle: '10+ years', icon: '👑' }
            ].map((level) => {
              const isSelected = watchedValues.experienceLevel === level.value;
              return (
                <label
                  key={level.value}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : errors.experienceLevel
                      ? 'border-red-300 bg-white hover:border-red-400'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    value={level.value}
                    {...register('experienceLevel')}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <div className="text-2xl mb-2">{level.icon}</div>
                    <div className={`font-medium text-sm ${
                      isSelected ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {level.label}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {level.subtitle}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
          {errors.experienceLevel && (
            <p className="mt-2 text-sm text-red-600">{errors.experienceLevel.message}</p>
          )}
        </div>

        {/* Required Skills */}
        <div>
          <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills *
          </label>
          <input
            type="text"
            id="requiredSkills"
            {...register('requiredSkills')}
            className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.requiredSkills ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., React, TypeScript, Node.js, AWS (comma-separated)"
          />
          {errors.requiredSkills && (
            <p className="mt-1 text-sm text-red-600">{errors.requiredSkills.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Separate skills with commas
          </p>
        </div>

        {/* Job Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={6}
            className={`w-full px-4 py-3 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={isClearDisabled}
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSaveAsFavorite}
              disabled={isSaveDisabled}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save as Favorite
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Continue to Resume Upload'}
            </button>
          </div>
        </div>
      </form>
    </div>

    {/* Dialog */}
    {dialog.isOpen && (
      <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center mb-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
              dialog.type === 'success' ? 'bg-green-100 text-green-600' :
              dialog.type === 'error' ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              {dialog.type === 'success' ? '✓' : dialog.type === 'error' ? '✕' : '⚠'}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{dialog.title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{dialog.message}</p>
          <div className="flex justify-end">
            <button
              onClick={closeDialog}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default JobRequirementsForm;
