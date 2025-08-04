import type { JobRequirements, JobRequirementsFavorite } from '../types';
import React, { useEffect, useState } from 'react';

interface JobRequirementsFormProps {
  onSubmit: (requirements: Omit<JobRequirements, 'id' | 'createdAt'>) => void;
  isLoading?: boolean;
}

const JobRequirementsForm: React.FC<JobRequirementsFormProps> = ({
  onSubmit, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<Omit<JobRequirements, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    requiredSkills: '',
    experienceLevel: 'entry', // Set default to entry level
    department: ''
  });

  const [favorites, setFavorites] = useState<JobRequirementsFavorite[]>([]);
  const [dialog, setDialog] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' | 'warning' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  // Check if all mandatory fields are filled
  const isSaveDisabled = !formData.title.trim() || !formData.department.trim() || 
    !formData.experienceLevel || !formData.requiredSkills.trim() || !formData.description.trim();

  // Check if any field has content (for Clear button)
  const isClearDisabled = !formData.title.trim() && !formData.department.trim() && 
    !formData.experienceLevel && !formData.requiredSkills.trim() && !formData.description.trim();

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simplify the requiredSkills transformation to avoid potential issues
    const requirements = {
      ...formData,
      requiredSkills: formData.requiredSkills.trim()
    };
    
    onSubmit(requirements);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAsFavorite = () => {
    if (!formData.title.trim()) {
      showDialog('Missing Information', 'Please enter a job title before saving as favorite.', 'warning');
      return;
    }

    // Check for duplicate titles (case-insensitive)
    const titleExists = favorites.some(
      favorite => favorite.title.toLowerCase() === formData.title.trim().toLowerCase()
    );

    if (titleExists) {
      showDialog('Duplicate Title', 'A favorite with this job title already exists. Please use a different title.', 'warning');
      return;
    }

    const newFavorite: JobRequirementsFavorite = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      requiredSkills: formData.requiredSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
        .join(', '),
      experienceLevel: formData.experienceLevel,
      department: formData.department,
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
    setFormData({
      title: favorite.title,
      description: favorite.description,
      requiredSkills: favorite.requiredSkills,
      experienceLevel: favorite.experienceLevel,
      department: favorite.department
    });
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
    setFormData({
      title: '',
      description: '',
      requiredSkills: '',
      experienceLevel: '',
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
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Job Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        {/* Department */}
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Engineering, Marketing, Sales"
          />
        </div>

        {/* Experience Level */}
        <div>
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level *
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="entry">Entry Level (0-2 years)</option>
            <option value="mid">Mid Level (3-5 years)</option>
            <option value="senior">Senior Level (6-10 years)</option>
            <option value="executive">Executive Level (10+ years)</option>
          </select>
        </div>

        {/* Required Skills */}
        <div>
          <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills *
          </label>
          <input
            type="text"
            id="requiredSkills"
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., React, TypeScript, Node.js, AWS (comma-separated)"
          />
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
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
          />
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
