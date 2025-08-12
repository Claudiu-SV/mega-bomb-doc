import jsPDF from 'jspdf';
import type { GeneratedInterview } from '../types';

export const exportInterviewToTextBasedPDF = (interview: GeneratedInterview, showDialog?: (title: string, message: string, type: 'success' | 'error' | 'warning') => void) => {
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
  
  try {
    // Create new jsPDF instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // PDF dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let currentY = margin;
    
    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
    };
    
    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, y + (index * (fontSize * 0.4)));
      });
      return lines.length * (fontSize * 0.4);
    };
    
    // Format date
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Interview Questions', margin, currentY);
    currentY += 12;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${formatDate(interview.generatedAt)}`, margin, currentY);
    currentY += 15;
    
    // Job Requirements Section
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(interview.jobRequirements.title, margin, currentY);
    currentY += 10;
    
    // Add job details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const jobDetails = [
      `Department: ${interview.jobRequirements.department}`,
      `Experience Level: ${interview.jobRequirements.experienceLevel}`,
      `Required Skills: ${interview.jobRequirements.requiredSkills}`,
      `Resume: ${interview.resume.fileName}`
    ];
    
    jobDetails.forEach(detail => {
      doc.text(detail, margin, currentY);
      currentY += 6;
    });
    
    currentY += 10;
    
    // Summary section
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Interview Assessment Summary', margin, currentY);
    currentY += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const summaryDetails = [
      `${ratedQuestions.length} of ${interview.questions.length} questions rated`,
      `Total Questions: ${ratedQuestions.length}`,
      `Total Duration: ${ratedQuestions.reduce((total, q) => total + q.suggestedTime, 0)} minutes`,
      `Technical Questions: ${ratedQuestions.filter(q => q.category === 'technical').length}`,
      `Behavioral Questions: ${ratedQuestions.filter(q => q.category === 'behavioral').length}`,
      `Average Rating: ${totalRating.toFixed(1)}/5.0`
    ];
    
    summaryDetails.forEach(detail => {
      doc.text(detail, margin, currentY);
      currentY += 6;
    });
    
    currentY += 15;
    
    // Questions section
    ratedQuestions.forEach((question, index) => {
      checkPageBreak(50); // Check if we need a new page for the question
      
      // Question header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Q${index + 1}`, margin, currentY);
      
      // Rating on the same line
      doc.text(`${question.rating}/5.0`, pageWidth - margin - 20, currentY);
      currentY += 8;
      
      // Category and difficulty tags
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${question.category.toUpperCase()}`, margin, currentY);
      doc.text(`${question.difficulty.toUpperCase()}`, margin + 30, currentY);
      doc.text(`${question.suggestedTime} MIN`, margin + 60, currentY);
      currentY += 8;
      
      // Question text
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const questionHeight = addWrappedText(question.question, margin, currentY, contentWidth, 12);
      currentY += questionHeight + 5;
      
      // Evaluation criteria
      if (question.evaluationCriteria) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('EVALUATION CRITERIA', margin, currentY);
        currentY += 5;
        
        doc.setFont('helvetica', 'normal');
        const criteriaHeight = addWrappedText(question.evaluationCriteria, margin, currentY, contentWidth, 10);
        currentY += criteriaHeight + 5;
      }
      
      // Interview assessment section
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Interview Assessment', margin, currentY);
      currentY += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Rating: ${question.rating}`, margin, currentY);
      currentY += 5;
      
      // Comments
      if (question.comment && question.comment.trim()) {
        const commentHeight = addWrappedText(question.comment, margin, currentY, contentWidth, 10);
        currentY += commentHeight + 5;
      } else {
        doc.text('No additional comments provided', margin, currentY);
        currentY += 5;
      }
      
      currentY += 10; // Space between questions
    });
    
    // Footer
    checkPageBreak(20);
    currentY = pageHeight - margin - 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Interview Questions Report', margin, currentY);
    doc.text('Generated by Mega Bomb Doc - Professional Interview Assessment Tool', margin, currentY + 5);
    
    // Generate filename
    const fileName = `Interview_Questions_${interview.jobRequirements.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    doc.save(fileName);
    
    // Show success message
    if (showDialog) {
      const questionCount = ratedQuestions.length;
      const message = `Text-based PDF with ${questionCount} rated question${questionCount !== 1 ? 's' : ''} has been downloaded successfully! This PDF will be readable by the comparison system.`;
      showDialog('PDF Downloaded', message, 'success');
    }
    
  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Show error message
    if (showDialog) {
      showDialog('Export Failed', 'There was an error generating the text-based PDF. Please try again.', 'error');
    } else {
      alert('There was an error generating the text-based PDF. Please try again.');
    }
  }
};
