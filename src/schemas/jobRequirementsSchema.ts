import { z } from 'zod';

export const jobRequirementsSchema = z.object({
  title: z.string()
    .min(1, 'Job title is required')
    .min(3, 'Job title must be at least 3 characters')
    .max(100, 'Job title must be less than 100 characters'),
  
  department: z.string()
    .min(1, 'Department is required')
    .min(2, 'Department must be at least 2 characters')
    .max(50, 'Department must be less than 50 characters'),
  
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).refine(
    (val) => val !== undefined,
    { message: 'Please select an experience level' }
  ),
  
  requiredSkills: z.string()
    .min(1, 'At least one required skill must be specified')
    .refine(
      (skills) => {
        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
        return skillsArray.length > 0;
      },
      'At least one valid skill must be specified'
    )
    .refine(
      (skills) => {
        const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
        return skillsArray.length <= 20;
      },
      'Maximum 20 skills allowed'
    ),
  
  description: z.string()
    .min(1, 'Job description is required')
    .min(10, 'Job description must be at least 10 characters')
    .max(2000, 'Job description must be less than 2000 characters')
});

export type JobRequirementsFormData = z.infer<typeof jobRequirementsSchema>;
