import type { GeneratedInterview } from '../types';
// @ts-expect-error - html2pdf.js doesn't have TypeScript definitions
import html2pdf from 'html2pdf.js';

export const exportInterviewToPDF = (interview: GeneratedInterview, showDialog?: (title: string, message: string, type: 'success' | 'error' | 'warning') => void) => {
  // Format the date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper functions for badge styling
  const getBadgeStyle = (category: string) => {
    switch (category) {
      case 'technical': return 'background: #dbeafe; color: #1e40af;';
      case 'behavioral': return 'background: #dcfce7; color: #166534;';
      case 'situational': return 'background: #fef3c7; color: #92400e;';
      case 'experience': return 'background: #e0e7ff; color: #3730a3;';
      default: return 'background: #f3f4f6; color: #374151;';
    }
  };

  const getDifficultyBadgeStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'background: #dcfce7; color: #166534;';
      case 'medium': return 'background: #fef3c7; color: #92400e;';
      case 'hard': return 'background: #fecaca; color: #991b1b;';
      default: return 'background: #f3f4f6; color: #374151;';
    }
  };

  // Create a temporary container element
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; background: white;">
      <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem;">
        <h1 style="color: #1f2937; margin: 0 0 0.5rem 0; font-size: 28px;">Interview Questions</h1>
        <p style="color: #6b7280; font-size: 16px; margin: 0;">Generated on ${formatDate(interview.generatedAt)}</p>
      </div>
      
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 2rem;">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 20px; color: #1f2937;">${interview.jobRequirements.title}</h2>
        <p style="margin: 0.25rem 0; color: #4b5563;"><strong>Department:</strong> ${interview.jobRequirements.department}</p>
        <p style="margin: 0.25rem 0; color: #4b5563;"><strong>Experience Level:</strong> ${interview.jobRequirements.experienceLevel.charAt(0).toUpperCase() + interview.jobRequirements.experienceLevel.slice(1)}</p>
        <p style="margin: 0.25rem 0; color: #4b5563;"><strong>Required Skills:</strong> ${interview.jobRequirements.requiredSkills}</p>
        <p style="margin: 0.25rem 0; color: #4b5563;"><strong>Resume:</strong> ${interview.resume.fileName}</p>
      </div>
      
      <div style="display: flex; justify-content: space-around; margin-bottom: 2rem; padding: 1rem; background: #eff6ff; border-radius: 8px;">
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${interview.questions.length}</div>
          <div style="font-size: 14px; color: #6b7280; text-transform: uppercase;">Total Questions</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${interview.totalEstimatedTime}</div>
          <div style="font-size: 14px; color: #6b7280; text-transform: uppercase;">Minutes</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${interview.questions.filter(q => q.category === 'technical').length}</div>
          <div style="font-size: 14px; color: #6b7280; text-transform: uppercase;">Technical</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #2563eb;">${interview.questions.filter(q => q.category === 'behavioral').length}</div>
          <div style="font-size: 14px; color: #6b7280; text-transform: uppercase;">Behavioral</div>
        </div>
      </div>
      
      <div style="margin-top: 2rem;">
        ${interview.questions.map((question, index) => `
          <div style="margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: white; page-break-inside: avoid;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 14px; font-weight: 500;">Q${index + 1}</span>
              <div style="display: flex; gap: 1rem;">
                <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; ${getBadgeStyle(question.category)}">${question.category}</span>
                <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; ${getDifficultyBadgeStyle(question.difficulty)}">${question.difficulty}</span>
                <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 12px; font-weight: 500; background: #f3f4f6; color: #374151;">${question.suggestedTime} min</span>
              </div>
            </div>
            
            <div style="font-size: 18px; font-weight: 500; color: #1f2937; margin: 1rem 0;">${question.question}</div>
            
            ${question.evaluationCriteria ? `
              <div style="background: #f9fafb; border-left: 4px solid #6b7280; padding: 1rem; margin-top: 1rem;">
                <h4 style="margin: 0 0 0.5rem 0; font-size: 14px; color: #4b5563; text-transform: uppercase;">Evaluation Criteria</h4>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${question.evaluationCriteria}</p>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Interview Questions - Generated by Mega Bomb Doc</p>
      </div>
    </div>
  `;

  // Generate filename with job title and date
  const fileName = `Interview_Questions_${interview.jobRequirements.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  // Configure PDF options
  const options = {
    margin: 0.5,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Generate and download PDF
  html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => {
      // Clean up the temporary element
      element.remove();
      
      // Show success message
      if (showDialog) {
        showDialog('PDF Downloaded', 'Your interview questions PDF has been downloaded successfully!', 'success');
      }
    })
    .catch((error: Error) => {
      console.error('PDF generation error:', error);
      element.remove();
      
      // Show error message
      if (showDialog) {
        showDialog('Export Failed', 'There was an error generating the PDF. Please try again.', 'error');
      } else {
        alert('There was an error generating the PDF. Please try again.');
      }
    });
}; 