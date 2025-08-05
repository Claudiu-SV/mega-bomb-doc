import type { GeneratedInterview } from '../types';
// @ts-expect-error - html2pdf.js doesn't have TypeScript definitions
import html2pdf from 'html2pdf.js';

export const exportInterviewToPDF = (interview: GeneratedInterview, showDialog?: (title: string, message: string, type: 'success' | 'error' | 'warning') => void) => {
  // Filter questions to only include those with ratings
  const ratedQuestions = interview.questions.filter(question => question.rating && question.rating > 0);
  
  // If no questions have ratings, show a warning and don't export
  if (ratedQuestions.length === 0) {
    if (showDialog) {
      showDialog('No Ratings Found', 'No questions have been rated yet. Please rate at least one question before exporting to PDF.', 'warning');
    }
    return;
  }
  
  // Calculate total rating (average of rated questions)
  const totalRating = ratedQuestions.reduce((sum, question) => sum + question.rating, 0) / ratedQuestions.length;
  
  // Create a modified interview object with only rated questions
  const filteredInterview = {
    ...interview,
    questions: ratedQuestions,
    totalEstimatedTime: ratedQuestions.reduce((total, q) => total + q.suggestedTime, 0)
  };

  // Format the date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Material Design Color Palette
  const colors = {
    primary: '#1976D2',
    primaryDark: '#1565C0',
    primaryLight: '#42A5F5',
    secondary: '#FF5722',
    secondaryDark: '#E64A19',
    secondaryLight: '#FF7043',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    surface: '#FFFFFF',
    background: '#FAFAFA',
    onSurface: '#212121',
    onSurfaceVariant: '#757575',
    outline: '#E0E0E0',
    divider: '#EEEEEE'
  };

  // Material Design elevation shadows
  const elevation = {
    1: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    2: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    4: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    8: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)'
  };

  // Material Design badge styling
  const getCategoryBadgeStyle = (category: string) => {
    switch (category) {
      case 'technical': 
        return `background: ${colors.primary}; color: white; box-shadow: ${elevation[1]};`;
      case 'behavioral': 
        return `background: ${colors.success}; color: white; box-shadow: ${elevation[1]};`;
      case 'situational': 
        return `background: ${colors.warning}; color: white; box-shadow: ${elevation[1]};`;
      case 'experience': 
        return `background: ${colors.secondary}; color: white; box-shadow: ${elevation[1]};`;
      default: 
        return `background: ${colors.onSurfaceVariant}; color: white; box-shadow: ${elevation[1]};`;
    }
  };

  const getDifficultyBadgeStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': 
        return `background: ${colors.success}; color: white; box-shadow: ${elevation[1]};`;
      case 'medium': 
        return `background: ${colors.warning}; color: white; box-shadow: ${elevation[1]};`;
      case 'hard': 
        return `background: ${colors.error}; color: white; box-shadow: ${elevation[1]};`;
      default: 
        return `background: ${colors.onSurfaceVariant}; color: white; box-shadow: ${elevation[1]};`;
    }
  };

  // Material Design star rating
  const generateMaterialStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += `<span style="color: ${colors.warning}; font-size: 20px; margin-right: 2px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">★</span>`;
    }
    // Half star
    if (hasHalfStar) {
      stars += `<span style="color: ${colors.warning}; font-size: 20px; margin-right: 2px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">☆</span>`;
    }
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += `<span style="color: ${colors.outline}; font-size: 20px; margin-right: 2px;">☆</span>`;
    }
    
    return stars;
  };

  // Material Design circular rating indicator
  const generateRatingCircle = (rating: number) => {
    let color = colors.error;
    if (rating >= 4) color = colors.success;
    else if (rating >= 3) color = colors.warning;
    
    return `
      <div style="position: relative; width: 60px; height: 60px; border-radius: 50%; background: ${colors.outline}; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
        <div style="position: absolute; width: 50px; height: 50px; border-radius: 50%; background: ${color}; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 16px; font-weight: 600;">${rating}</span>
        </div>
      </div>
    `;
  };

      // Create a temporary container element
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: ${colors.onSurface}; padding: 20px; background: white; max-width: 800px; margin: 0 auto;">
      
      <!-- Clean Header -->
      <div style="background: ${colors.primary}; padding: 30px 20px; border-radius: 12px; margin-bottom: 30px; text-align: center; box-shadow: ${elevation[2]};">
        <h1 style="color: white; margin: 0 0 8px 0; font-size: 32px; font-weight: 400;">Interview Questions</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Generated on ${formatDate(filteredInterview.generatedAt)}</p>
      </div>
      
      <!-- Job Requirements -->
      <div style="background: ${colors.surface}; border: 1px solid ${colors.outline}; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
        <h2 style="margin: 0 0 20px 0; font-size: 24px; color: ${colors.onSurface}; font-weight: 500; border-bottom: 2px solid ${colors.primary}; padding-bottom: 8px;">${filteredInterview.jobRequirements.title}</h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%; padding: 12px 16px 12px 0; vertical-align: top;">
              <div style="margin-bottom: 16px;">
                <strong style="color: ${colors.primary}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Department</strong>
                <div style="color: ${colors.onSurface}; font-size: 16px; margin-top: 4px;">${filteredInterview.jobRequirements.department}</div>
              </div>
              <div>
                <strong style="color: ${colors.secondary}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Experience Level</strong>
                <div style="color: ${colors.onSurface}; font-size: 16px; margin-top: 4px;">${filteredInterview.jobRequirements.experienceLevel.charAt(0).toUpperCase() + filteredInterview.jobRequirements.experienceLevel.slice(1)}</div>
              </div>
            </td>
            <td style="width: 50%; padding: 12px 0 12px 16px; vertical-align: top; border-left: 1px solid ${colors.outline};">
              <div style="margin-bottom: 16px;">
                <strong style="color: ${colors.success}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Required Skills</strong>
                <div style="color: ${colors.onSurface}; font-size: 16px; margin-top: 4px;">${filteredInterview.jobRequirements.requiredSkills}</div>
              </div>
              <div>
                <strong style="color: ${colors.warning}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Resume</strong>
                <div style="color: ${colors.onSurface}; font-size: 16px; margin-top: 4px;">${filteredInterview.resume.fileName}</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Stats Summary -->
      <div style="margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 20%; text-align: center; padding: 20px; background: ${colors.surface}; border: 1px solid ${colors.outline}; border-right: none;">
              <div style="font-size: 28px; font-weight: 500; color: ${colors.primary}; margin-bottom: 4px;">${filteredInterview.questions.length}</div>
              <div style="font-size: 12px; color: ${colors.onSurfaceVariant}; text-transform: uppercase; letter-spacing: 0.5px;">Questions</div>
            </td>
            <td style="width: 20%; text-align: center; padding: 20px; background: ${colors.surface}; border: 1px solid ${colors.outline}; border-right: none;">
              <div style="font-size: 28px; font-weight: 500; color: ${colors.success}; margin-bottom: 4px;">${filteredInterview.totalEstimatedTime}</div>
              <div style="font-size: 12px; color: ${colors.onSurfaceVariant}; text-transform: uppercase; letter-spacing: 0.5px;">Minutes</div>
            </td>
            <td style="width: 20%; text-align: center; padding: 20px; background: ${colors.surface}; border: 1px solid ${colors.outline}; border-right: none;">
              <div style="font-size: 28px; font-weight: 500; color: ${colors.warning}; margin-bottom: 4px;">${filteredInterview.questions.filter(q => q.category === 'technical').length}</div>
              <div style="font-size: 12px; color: ${colors.onSurfaceVariant}; text-transform: uppercase; letter-spacing: 0.5px;">Technical</div>
            </td>
            <td style="width: 20%; text-align: center; padding: 20px; background: ${colors.surface}; border: 1px solid ${colors.outline}; border-right: none;">
              <div style="font-size: 28px; font-weight: 500; color: ${colors.secondary}; margin-bottom: 4px;">${filteredInterview.questions.filter(q => q.category === 'behavioral').length}</div>
              <div style="font-size: 12px; color: ${colors.onSurfaceVariant}; text-transform: uppercase; letter-spacing: 0.5px;">Behavioral</div>
            </td>
            <td style="width: 20%; text-align: center; padding: 20px; background: ${colors.surface}; border: 1px solid ${colors.outline};">
              <div style="font-size: 28px; font-weight: 500; color: ${colors.warning}; margin-bottom: 4px;">${totalRating.toFixed(1)}</div>
              <div style="font-size: 12px; color: ${colors.onSurfaceVariant}; text-transform: uppercase; letter-spacing: 0.5px;">Avg Rating</div>
            </td>
          </tr>
                </table>
      </div>
      
      <!-- Rating Summary Section -->
      <div style="background: linear-gradient(135deg, ${colors.primary}20, ${colors.primaryLight}10); border: 1px solid ${colors.primary}; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: middle; width: 60%;">
              <h3 style="margin: 0 0 8px 0; font-size: 20px; color: ${colors.primary}; font-weight: 600;">Interview Assessment Summary</h3>
              <p style="margin: 0; color: ${colors.onSurface}; font-size: 16px;">${ratedQuestions.length} of ${filteredInterview.questions.length} questions rated</p>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 40%;">
              <div style="display: inline-block; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid ${colors.outline};">
                <div style="font-size: 36px; font-weight: 600; color: ${colors.primary}; margin-bottom: 8px;">${totalRating.toFixed(1)}/5.0</div>
                <div style="margin-bottom: 8px;">
                  ${generateMaterialStarRating(totalRating)}
                </div>
                <div style="font-size: 14px; color: ${colors.onSurfaceVariant}; font-weight: 500;">Overall Rating</div>
              </div>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Questions Section -->
       ${filteredInterview.questions.map((question, index) => `
         <div style="background: ${colors.surface}; border: 1px solid ${colors.outline}; border-radius: 12px; padding: 24px; margin-bottom: 24px; page-break-inside: avoid;">
           
           <!-- Question Header -->
           <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid ${colors.divider};">
             <table style="width: 100%; border-collapse: collapse;">
               <tr>
                 <td style="width: 120px; vertical-align: top;">
                   <div style="background: ${colors.primary}; color: white; padding: 12px 16px; border-radius: 8px; text-align: center; font-size: 16px; font-weight: 500;">Q${index + 1}</div>
                 </td>
                 <td style="text-align: center; vertical-align: top; padding: 0 20px;">
                   <div style="margin-bottom: 8px;">
                     ${generateMaterialStarRating(question.rating)}
                   </div>
                   <div style="color: ${colors.onSurfaceVariant}; font-size: 14px; font-weight: 500;">${question.rating}/5.0</div>
                 </td>
                 <td style="width: 120px; text-align: center; vertical-align: top;">
                   ${generateRatingCircle(question.rating)}
                 </td>
               </tr>
             </table>
             
             <!-- Tags Row -->
             <div style="text-align: center; margin-top: 16px;">
               <span style="display: inline-block; margin: 4px 6px; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 500; text-transform: uppercase; ${getCategoryBadgeStyle(question.category)}">${question.category}</span>
               <span style="display: inline-block; margin: 4px 6px; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 500; text-transform: uppercase; ${getDifficultyBadgeStyle(question.difficulty)}">${question.difficulty}</span>
               <span style="display: inline-block; margin: 4px 6px; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 500; background: ${colors.onSurfaceVariant}; color: white;">${question.suggestedTime} MIN</span>
             </div>
           </div>
           
           <!-- Question Text -->
           <div style="margin-bottom: 20px;">
             <h3 style="font-size: 20px; font-weight: 400; color: ${colors.onSurface}; margin: 0; line-height: 1.4;">${question.question}</h3>
           </div>
           
           <!-- Evaluation Criteria -->
           ${question.evaluationCriteria ? `
             <div style="background: #f8f9fa; border-left: 4px solid ${colors.primary}; padding: 16px; margin: 16px 0; border-radius: 4px;">
               <strong style="color: ${colors.primary}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Evaluation Criteria</strong>
               <p style="margin: 8px 0 0 0; color: ${colors.onSurface}; font-size: 15px; line-height: 1.5;">${question.evaluationCriteria}</p>
             </div>
           ` : ''}
           
           <!-- Assessment Section -->
           <div style="background: #f8f9fa; border: 1px solid ${colors.outline}; border-radius: 8px; padding: 16px; margin-top: 16px;">
             <table style="width: 100%; border-collapse: collapse;">
               <tr>
                 <td style="vertical-align: top; width: 50%;">
                   <strong style="color: ${colors.onSurface}; font-size: 16px;">Interview Assessment</strong>
                 </td>
                 <td style="text-align: right; vertical-align: top;">
                   <div style="display: inline-block; background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid ${colors.outline};">
                     <span style="color: ${colors.onSurfaceVariant}; font-size: 14px; margin-right: 8px;">Rating:</span>
                     ${generateMaterialStarRating(question.rating)}
                     <span style="color: ${colors.onSurface}; font-weight: 600; font-size: 16px; margin-left: 8px;">${question.rating}</span>
                   </div>
                 </td>
               </tr>
             </table>
             
             <!-- Comments -->
             ${question.comment ? `
               <div style="background: white; border: 1px solid ${colors.outline}; border-radius: 6px; padding: 12px; margin-top: 12px;">
                 <p style="margin: 0; color: ${colors.onSurface}; font-size: 15px; line-height: 1.5; font-style: italic;">"${question.comment}"</p>
               </div>
             ` : `
               <div style="background: white; border: 1px dashed ${colors.outline}; border-radius: 6px; padding: 12px; margin-top: 12px; text-align: center;">
                 <p style="margin: 0; color: ${colors.onSurfaceVariant}; font-size: 14px; font-style: italic;">No additional comments provided</p>
               </div>
             `}
           </div>
           
         </div>
       `).join('')}
      
             <!-- Footer -->
       <div style="margin-top: 40px; padding: 20px; text-align: center; background: ${colors.surface}; border: 1px solid ${colors.outline}; border-radius: 8px;">
         <h3 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 500; color: ${colors.onSurface};">Interview Questions Report</h3>
         <p style="margin: 0; font-size: 14px; color: ${colors.onSurfaceVariant};">Generated by Mega Bomb Doc • Professional Interview Assessment Tool</p>
       </div>
      
    </div>
  `;

  // Generate filename with job title and date
  const fileName = `Interview_Questions_${filteredInterview.jobRequirements.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

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
        const questionCount = filteredInterview.questions.length;
        const message = `PDF with ${questionCount} rated question${questionCount !== 1 ? 's' : ''} has been downloaded successfully!`;
        showDialog('PDF Downloaded', message, 'success');
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