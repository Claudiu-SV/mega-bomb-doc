/**
 * Format time in minutes to a human-readable string
 * @param minutes - Time in minutes
 * @returns Formatted time string (e.g., "30m", "1h 30m", "2h")
 */
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Get the appropriate color class for a question category
 * @param category - Question category
 * @returns Tailwind CSS class string for the category
 */
export const getCategoryColor = (category: string): string => {
  const colors = {
    technical: 'bg-blue-100 text-blue-800',
    behavioral: 'bg-green-100 text-green-800',
    situational: 'bg-yellow-100 text-yellow-800',
    experience: 'bg-purple-100 text-purple-800'
  };
  return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

/**
 * Get the appropriate color class for a question difficulty
 * @param difficulty - Question difficulty
 * @returns Tailwind CSS class string for the difficulty
 */
export const getDifficultyColor = (difficulty: string): string => {
  const colors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };
  return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};
