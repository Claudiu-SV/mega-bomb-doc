import type { JobRequirements, JobRequirementsFavorite } from '../types';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobRequirementsSchema, type JobRequirementsFormData } from '../schemas/jobRequirementsSchema';

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
          <h3 className="text-md font-medium text-gray-700 mb-3">Saved Favorites</h3>
          <div className="flex flex-wrap gap-2">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative">
                <button
                  type="button"
                  onClick={() => handleLoadFavorite(favorite)}
                  className="pl-3 pr-8 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-md transition-colors border border-gray-300"
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
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-300 rounded-full transition-colors text-xs"
                  title="Delete favorite"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            {...register('title')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Senior Software Engineer"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <input
            type="text"
            id="department"
            {...register('department')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.department ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Engineering, Marketing, Sales"
          />
          {errors.department && (
            <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level *
          </label>
          <select
            id="experienceLevel"
            {...register('experienceLevel')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.experienceLevel ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (3-5 years)</option>
            <option value="senior">Senior Level (6-10 years)</option>
            <option value="executive">Executive Level (10+ years)</option>
          </select>
          {errors.experienceLevel && (
            <p className="mt-1 text-sm text-red-600">{errors.experienceLevel.message}</p>
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
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
            className="px-6 py-2 bg-gray-600 text-white font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSaveAsFavorite}
              disabled={isSaveDisabled}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Favorite
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
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
