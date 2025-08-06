import pdfParse from 'pdf-parse';
import fs from 'fs';
import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import { createWorker } from 'tesseract.js';
import pdf2pic from 'pdf2pic';
import * as path from 'path';

const execAsync = promisify(exec);

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'experience';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  rating: number;
  maxRating: number;
  comments?: string;
  evaluationCriteria: string;
}

export interface InterviewAssessment {
  candidateName: string;
  jobTitle: string;
  department: string;
  experienceLevel: string;
  requiredSkills: string[];
  resumeFileName: string;
  generatedDate: Date;
  totalQuestions: number;
  totalDuration: number;
  questionsRated: number;
  averageRating: number;
  questions: InterviewQuestion[];
  categoryBreakdown: {
    technical: number;
    behavioral: number;
    situational: number;
    experience: number;
  };
}

/**
 * Try extracting text using OCR from PDF images
 */
async function tryOCRExtraction(filePath: string, maxPagesToProcess?: number): Promise<string> {
  try {
    console.log('Starting OCR extraction...');
    
    // Convert PDF to images
    const convert = pdf2pic.fromPath(filePath, {
      density: 300,           // Higher density for better OCR accuracy
      saveFilename: "page",
      savePath: path.dirname(filePath),
      format: "png",
      width: 2000,
      height: 2000
    });
    
    // Determine number of pages to process - get total page count from PDF
    let maxPages = maxPagesToProcess || 3; // Use parameter or default fallback
    try {
      // Get total page count from the PDF
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      if (!maxPagesToProcess) {
        // If no limit specified, process all pages
        maxPages = pdfData.numpages;
      } else {
        // Use the smaller of the specified limit or total pages
        maxPages = Math.min(maxPagesToProcess, pdfData.numpages);
      }
      
      console.log(`PDF has ${pdfData.numpages} pages, will process ${maxPages} pages with OCR`);
    } catch (error) {
      console.log('Could not determine page count, using specified or default limit');
      if (!maxPagesToProcess) {
        maxPages = 10; // Process more pages if we can't determine total
      }
    }
    
    let fullText = '';
    
    // Initialize Tesseract worker
    const worker = await createWorker('eng');
    
    try {
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          console.log(`Processing page ${pageNum} with OCR...`);
          const result = await convert(pageNum);
          
          if (result.path) {
            const { data: { text } } = await worker.recognize(result.path);
            fullText += text + '\n';
            console.log(`Page ${pageNum} OCR extracted ${text.length} characters`);
            
            // Clean up temp image file
            try {
              fs.unlinkSync(result.path);
            } catch (cleanupError) {
              console.log('Could not cleanup temp file:', result.path);
            }
          }
        } catch (pageError) {
          console.log(`OCR failed for page ${pageNum}:`, pageError instanceof Error ? pageError.message : String(pageError));
          // Continue with other pages
        }
      }
    } finally {
      await worker.terminate();
    }
    
    console.log(`OCR extraction completed. Total text length: ${fullText.length}`);
    return fullText;
  } catch (error) {
    console.log('OCR extraction failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Try extracting text using pdftotext command line tool as fallback
 */
async function tryPdftotextExtraction(filePath: string): Promise<string> {
  try {
    const result = execSync(`pdftotext "${filePath}" -`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    console.log(`pdftotext extracted ${result.length} characters`);
    return result;
  } catch (error) {
    console.log('pdftotext not available or failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

let candidateCounter = 0;

export async function parseInterviewAssessmentPDF(filePath: string): Promise<InterviewAssessment> {
  try {
    console.log(`PDF file info: ${fs.statSync(filePath).size} bytes`);
    
    // Try standard PDF text extraction first
    const data = await pdfParse(fs.readFileSync(filePath));
    console.log(`Initial PDF parsing results: ${data.numpages} pages, ${data.text.length} characters extracted`);
    
    let extractedText = data.text;
    
    // If standard extraction yields minimal text, try OCR
    if (extractedText.trim().length < 100) {
      console.log('Standard pdf-parse extracted minimal text, trying alternative methods...');
      console.log('Trying alternative PDF extraction methods...');
      
      try {
        extractedText = await tryOCRExtraction(filePath);
        console.log(`OCR extraction completed. Text length: ${extractedText.length}`);
      } catch (ocrError) {
        console.log('OCR extraction failed:', ocrError instanceof Error ? ocrError.message : ocrError);
        throw new Error(`All PDF text extraction methods failed. The PDF may contain:
        • Scanned images instead of selectable text
        • Protected/encrypted content  
        • Complex formatting that cannot be parsed
        • Unsupported PDF version or encoding
        
        Please ensure your Interview Assessment PDF contains selectable text content. You can test this by trying to select and copy text from the PDF in a PDF viewer.
        
        If the text is selectable but this error persists, the PDF may use an unsupported encoding format.`);
      }
    }

    // Increment counter for unique candidate names
    candidateCounter++;
    
    // Extract assessment data from the text
    return extractAssessmentData(extractedText, candidateCounter);
    
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse interview assessment PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractAssessmentData(text: string, candidateNumber: number): InterviewAssessment {
  console.log('PDF text extraction results:');
  console.log(`- Raw text length: ${text.length}`);
  console.log(`- Trimmed text length: ${text.trim().length}`);
  console.log(`- Text content preview: "${text.substring(0, 100)}"`);

  if (text.trim().length === 0) {
    throw new Error(`All PDF text extraction methods failed. The PDF may contain:
        • Scanned images instead of selectable text
        • Protected/encrypted content  
        • Complex formatting that cannot be parsed
        • Unsupported PDF version or encoding
        
        Please ensure your Interview Assessment PDF contains selectable text content. You can test this by trying to select and copy text from the PDF in a PDF viewer.
        
        If the text is selectable but this error persists, the PDF may use an unsupported encoding format.`);
  }

  // Use generated candidate name by default
  const candidateName = `Candidate ${candidateNumber}`;

  // Extract basic info with improved patterns
  const assessment: InterviewAssessment = {
    candidateName: candidateName, // Use extracted or generated name
    jobTitle: '',
    department: '',
    experienceLevel: '',
    requiredSkills: [],
    resumeFileName: '',
    generatedDate: new Date(),
    totalQuestions: 0,
    totalDuration: 0,
    questionsRated: 0,
    averageRating: 0,
    questions: [],
    categoryBreakdown: {
      technical: 0,
      behavioral: 0,
      situational: 0,
      experience: 0
    }
  };

  // Split text into lines for processing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  // If PDF text is empty or very short, provide detailed diagnostic information
  if (!text || text.trim().length < 50) {
    console.log('PDF text extraction results:');
    console.log('- Raw text length:', text ? text.length : 0);
    console.log('- Trimmed text length:', text ? text.trim().length : 0);
    console.log('- Text content preview:', JSON.stringify(text.substring(0, 100)));
    
    // Try to provide helpful error message based on the content
    if (text && text.length > 0 && text.length < 50) {
      throw new Error(`PDF contains minimal text content (${text.length} characters). This PDF may contain:
        • Scanned images instead of selectable text
        • Protected/encrypted content
        • Complex formatting that cannot be parsed
        
        Please ensure your Interview Assessment PDF contains selectable text content. You can test this by trying to select and copy text from the PDF in a PDF viewer.`);
    } else {
      throw new Error(`No readable text content found in PDF. This PDF may be:
        • A scanned document (image-only PDF)
        • Password protected or encrypted
        • Corrupted or not a valid PDF
        
        Please upload an Interview Assessment PDF that contains selectable text content.`);
    }
  }

  let currentQuestion: Partial<InterviewQuestion> = {};
  let questionIndex = 0;

  console.log('Parsing PDF with', lines.length, 'lines of text');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';

    // Extract candidate name - skip the complex extraction, use generated name
    // OCR often produces garbled text for names, so we'll use the generated candidate name

    // Extract basic info with improved patterns
    if (line.includes('Generated on') || line.includes('Date:') || line.includes('Created:')) {
      const dateMatch = line.match(/(?:Generated on|Date|Created):\s*(.+)/i);
      if (dateMatch) {
        try {
          assessment.generatedDate = new Date(dateMatch[1]);
        } catch (e) {
          console.log('Could not parse date:', dateMatch[1]);
        }
      }
    }

    // Job title extraction - handle formats like "MobileDeveloper" or "Mobile Developer"
    if (line.match(/(?:Position|Job Title|Role):/i) && nextLine) {
      assessment.jobTitle = nextLine.trim();
    } else if (line.match(/^(Software Engineer|Developer|Manager|Analyst|Designer|Consultant|MobileDeveloper|Mobile Developer)/i)) {
      if (!assessment.jobTitle) {
        // Clean up concatenated words like "MobileDeveloper"
        let jobTitle = line.trim();
        if (jobTitle === 'MobileDeveloper') {
          jobTitle = 'Mobile Developer';
        }
        assessment.jobTitle = jobTitle;
        console.log('Found job title:', jobTitle);
      }
    }

    // Extract job title, department, experience level with flexible patterns
    if ((line === 'DEPARTMENT' || line.includes('Department:')) && nextLine) {
      assessment.department = nextLine.trim();
    } else if ((line === 'EXPERIENCE LEVEL' || line.includes('Experience:')) && nextLine) {
      assessment.experienceLevel = nextLine.trim();
    } else if ((line === 'REQUIRED SKILLS' || line.includes('Skills:')) && nextLine) {
      // Handle comma-separated skills or single skill
      const skills = nextLine.split(',').map(s => s.trim()).filter(s => s.length > 0);
      assessment.requiredSkills = skills.length > 0 ? skills : [nextLine.trim()];
    } else if ((line === 'RESUME' || line.includes('Resume:')) && nextLine) {
      assessment.resumeFileName = nextLine.trim();
      // Try to extract candidate name from resume filename if not already found
      if (!assessment.candidateName || assessment.candidateName === 'Unknown Candidate') {
        const nameParts = nextLine.replace('.pdf', '').split(/[_\-\s]+/);
        if (nameParts.length >= 2) {
          assessment.candidateName = `${nameParts[0]} ${nameParts[1]}`.replace(/[^a-zA-Z\s]/g, '').trim();
        }
      }
    }

    // Extract summary statistics with improved patterns
    if (line.includes('QUESTIONS') || line.match(/(\d+)\s*Questions?/i)) {
      const questionsMatch = line.match(/(\d+)\s*(?:QUESTIONS?|questions?)/i);
      if (questionsMatch) {
        assessment.totalQuestions = parseInt(questionsMatch[1]);
      }
    }

    if (line.includes('MINUTES') || line.match(/(\d+)\s*(?:minutes?|mins?)/i)) {
      const minutesMatch = line.match(/(\d+)\s*(?:MINUTES?|minutes?|mins?)/i);
      if (minutesMatch) {
        assessment.totalDuration = parseInt(minutesMatch[1]);
      }
    }

    if (line.includes('AVG RATING') || line.includes('Average Rating') || line.match(/Average:\s*([\d.]+)/i)) {
      const ratingMatch = line.match(/([\d.]+)\s*(?:AVG RATING|Average Rating|Average)/i);
      if (ratingMatch) {
        assessment.averageRating = parseFloat(ratingMatch[1]);
      }
    }

    if (line.includes('questions rated') || line.match(/(\d+)\s*of\s*\d+\s*(?:questions\s*)?rated/i)) {
      const ratedMatch = line.match(/(\d+)\s*of\s*\d+\s*(?:questions\s*)?rated/i);
      if (ratedMatch) {
        assessment.questionsRated = parseInt(ratedMatch[1]);
      }
    }

    // Parse individual questions with improved patterns for this specific format
    
    // Look for rating patterns like "2/5.0" which indicate the start of a new question
    if (line.match(/^\d+(\.\d+)?\/5\.0?$/)) {
      // Save previous question if exists
      if (currentQuestion.id && currentQuestion.question) {
        // Ensure all required fields are present
        if (!currentQuestion.evaluationCriteria) {
          currentQuestion.evaluationCriteria = 'Standard evaluation criteria';
        }
        if (!currentQuestion.category) {
          currentQuestion.category = 'technical'; // Default category
        }
        if (!currentQuestion.difficulty) {
          currentQuestion.difficulty = 'medium'; // Default difficulty
        }
        
        assessment.questions.push(currentQuestion as InterviewQuestion);
        
        // Auto-detect category based on question content if not explicitly set
        if (currentQuestion.category === 'technical') {
          const questionText = currentQuestion.question?.toLowerCase() || '';
          if (questionText.includes('situation') || questionText.includes('time when') || 
              questionText.includes('experience') || questionText.includes('example')) {
            currentQuestion.category = 'behavioral';
          } else if (questionText.includes('difficult') || questionText.includes('conflict') ||
                    questionText.includes('challenge') || questionText.includes('problem')) {
            currentQuestion.category = 'situational';
          }
        }
        
        // Update category breakdown
        const category = currentQuestion.category as keyof typeof assessment.categoryBreakdown;
        if (category && assessment.categoryBreakdown.hasOwnProperty(category)) {
          assessment.categoryBreakdown[category]++;
        }
      }

      // Start new question
      questionIndex++;
      const ratingMatch = line.match(/^(\d+(?:\.\d+)?)\/5\.0?$/);
      currentQuestion = {
        id: `Q${questionIndex}`,
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
        maxRating: 5,
        duration: 5, // default
        category: 'technical' // will be updated if found
      };
      console.log('Found question with rating:', currentQuestion.id, 'rating:', currentQuestion.rating);
      
      // Look ahead for the question text (usually 2-3 lines after the rating)
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.length > 20 && 
            !nextLine.match(/^(TECHNICAL|BEHAVIORAL|SITUATIONAL|EXPERIENCE|EASY|MEDIUM|HARD)$/i) &&
            !nextLine.includes('EVALUATION CRITERIA') &&
            !nextLine.includes('Interview Assessment') &&
            !nextLine.includes('Rating:') &&
            !nextLine.match(/^\d+\/5/) &&
            !nextLine.match(/^\d+\s*(MIN|minutes?)/i)) {
          currentQuestion.question = nextLine;
          console.log(`Set question text for ${currentQuestion.id}: ${nextLine.substring(0, 50)}...`);
          break;
        }
      }
    }

    // Extract question text if we're in a question context and haven't found it yet
    if (currentQuestion && currentQuestion.id && !currentQuestion.question) {
      // Look for substantial text that could be a question
      if (line.length > 20 && 
          !line.match(/^(TECHNICAL|BEHAVIORAL|SITUATIONAL|EXPERIENCE|EASY|MEDIUM|HARD)$/i) &&
          !line.includes('EVALUATION CRITERIA') &&
          !line.includes('Interview Assessment') &&
          !line.includes('Rating:') &&
          !line.includes('/5') &&
          !line.match(/^\d+\s*(MIN|minutes?)/i) &&
          !line.match(/Category:/i) &&
          !line.match(/Difficulty:/i) &&
          line.includes('?')) { // Questions usually end with ?
        currentQuestion.question = line.trim();
        console.log(`Set question text for ${currentQuestion.id}: ${line.substring(0, 50)}...`);
      }
    }

    // Extract question category and difficulty with flexible patterns
    if (line.match(/^(TECHNICAL|BEHAVIORAL|SITUATIONAL|EXPERIENCE)$/i) || 
        line.match(/Category:\s*(technical|behavioral|situational|experience)/i)) {
      if (currentQuestion) {
        const categoryMatch = line.match(/(?:Category:\s*)?(\w+)/i);
        if (categoryMatch) {
          currentQuestion.category = categoryMatch[1].toLowerCase() as any;
          console.log(`Set category for ${currentQuestion.id}: ${currentQuestion.category}`);
        }
      }
    }

    if (line.match(/^(EASY|MEDIUM|HARD)$/i) || 
        line.match(/Difficulty:\s*(easy|medium|hard)/i)) {
      if (currentQuestion) {
        const difficultyMatch = line.match(/(?:Difficulty:\s*)?(\w+)/i);
        if (difficultyMatch) {
          currentQuestion.difficulty = difficultyMatch[1].toLowerCase() as any;
        }
      }
    }

    // Extract duration with flexible patterns
    if (line.includes('MIN') || line.match(/(\d+)\s*(?:minutes?|mins?)/i)) {
      const durationMatch = line.match(/(\d+)\s*(?:MIN|minutes?|mins?)/i);
      if (durationMatch && currentQuestion) {
        currentQuestion.duration = parseInt(durationMatch[1]);
      }
    }

    // Extract question text - look for longer descriptive lines
    if (currentQuestion && currentQuestion.id && !currentQuestion.question) {
      // Skip metadata lines but capture question content
      if (line.length > 20 && 
          !line.match(/^(TECHNICAL|BEHAVIORAL|SITUATIONAL|EXPERIENCE|EASY|MEDIUM|HARD)$/i) &&
          !line.includes('EVALUATION CRITERIA') &&
          !line.includes('Rating:') &&
          !line.includes('/5') &&
          !line.match(/^\d+\s*(MIN|minutes?)/i) &&
          !line.match(/Category:/i) &&
          !line.match(/Difficulty:/i)) {
        currentQuestion.question = line.trim();
        console.log(`Set question text for ${currentQuestion.id}: ${line.substring(0, 50)}...`);
      }
    }

    // Extract evaluation criteria - look for text after "EVALUATION CRITERIA"
    if (line === 'EVALUATION CRITERIA' && currentQuestion) {
      // Look ahead for the criteria text (usually on the next few lines)
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const criteriaLine = lines[j].trim();
        if (criteriaLine.length > 10 && 
            !criteriaLine.includes('Interview Assessment') &&
            !criteriaLine.includes('Rating:') &&
            !criteriaLine.match(/^\d+\/5/)) {
          currentQuestion.evaluationCriteria = criteriaLine;
          console.log(`Set evaluation criteria for ${currentQuestion.id}: ${criteriaLine.substring(0, 50)}...`);
          break;
        }
      }
    } else if (line.includes('Criteria:') && currentQuestion) {
      const criteriaMatch = line.match(/Criteria:\s*(.+)/i);
      if (criteriaMatch) {
        currentQuestion.evaluationCriteria = criteriaMatch[1].trim();
      }
    }

    // Extract interview rating and comments with improved patterns
    if ((line.includes('Interview Assessment') || line.includes('Comments:') || line.includes('Feedback:')) && currentQuestion) {
      // Look for rating in current or next few lines
      for (let j = i; j < Math.min(i + 5, lines.length); j++) {
        const ratingLine = lines[j];
        
        // Extract rating
        if (ratingLine.includes('Rating:') || ratingLine.includes('Score:')) {
          const ratingMatch = ratingLine.match(/(?:Rating|Score):\s*(\d+(?:\.\d+)?)/i);
          if (ratingMatch) {
            currentQuestion.rating = parseFloat(ratingMatch[1]);
            console.log(`Updated rating for ${currentQuestion.id}: ${currentQuestion.rating}`);
          }
        }
        
        // Extract comments
        if (ratingLine.includes('Comments:') || ratingLine.includes('Feedback:')) {
          const commentMatch = ratingLine.match(/(?:Comments|Feedback):\s*(.+)/i);
          if (commentMatch && commentMatch[1] && !commentMatch[1].includes('No additional comments')) {
            currentQuestion.comments = commentMatch[1].trim();
          }
        }
      }
    }
  }

  // Add the last question
  if (currentQuestion.id && currentQuestion.question) {
    // Ensure all required fields are present
    if (!currentQuestion.evaluationCriteria) {
      currentQuestion.evaluationCriteria = 'Standard evaluation criteria';
    }
    if (!currentQuestion.category) {
      currentQuestion.category = 'technical'; // Default category
    }
    if (!currentQuestion.difficulty) {
      currentQuestion.difficulty = 'medium'; // Default difficulty
    }
    
    assessment.questions.push(currentQuestion as InterviewQuestion);
    
    const category = currentQuestion.category as keyof typeof assessment.categoryBreakdown;
    if (category && assessment.categoryBreakdown.hasOwnProperty(category)) {
      assessment.categoryBreakdown[category]++;
    }
  }

  // Fill in missing job title from context
  if (!assessment.jobTitle) {
    assessment.jobTitle = 'Interview Position'; // Generic default
  }

  // Validate and clean up data - only keep questions with actual content
  const validQuestions = assessment.questions.filter(q => q.question && q.question.length > 10 && q.category);
  assessment.questions = validQuestions;
  
  console.log(`Parsed ${validQuestions.length} valid questions from PDF`);
  
  // Clean up candidate name if it's garbled from OCR
  if (assessment.candidateName && 
      (assessment.candidateName.includes('assessment') || 
       assessment.candidateName.includes('unknown') ||
       assessment.candidateName.includes('Assessment') ||
       assessment.candidateName.length > 50)) {
    assessment.candidateName = candidateName; // Use the generated name
  }
  
  // Ensure we have a clean candidate name
  if (!assessment.candidateName || assessment.candidateName === 'Unknown Candidate') {
    assessment.candidateName = candidateName; // Use the generated name
  }
  
  // Validate that we have meaningful data
  if (assessment.questions.length === 0) {
    throw new Error('No valid interview questions found in the PDF. Please ensure the PDF contains properly formatted interview assessment data with questions and ratings.');
  }
  
  console.log('Final parsed assessment:', {
    candidateName: assessment.candidateName,
    jobTitle: assessment.jobTitle,
    totalQuestions: assessment.questions.length,
    averageRating: assessment.averageRating,
    categoryBreakdown: assessment.categoryBreakdown
  });

  return assessment;
}

/**
 * Calculate scores based on interview assessment
 */
export function calculateCandidateScores(assessment: InterviewAssessment): any {
  const questions = assessment.questions;
  
  if (questions.length === 0) {
    throw new Error('No questions found in assessment');
  }

  // Calculate category scores (convert to percentage scale)
  const technicalQuestions = questions.filter(q => q.category === 'technical');
  const behavioralQuestions = questions.filter(q => q.category === 'behavioral');
  const situationalQuestions = questions.filter(q => q.category === 'situational');
  const experienceQuestions = questions.filter(q => q.category === 'experience');

  // Calculate average ratings for each category (1-5 scale) then convert to percentage
  const technicalScore = technicalQuestions.length > 0 
    ? Math.round((technicalQuestions.reduce((sum, q) => sum + q.rating, 0) / technicalQuestions.length / 5) * 100)
    : 0;

  const behavioralScore = behavioralQuestions.length > 0
    ? Math.round((behavioralQuestions.reduce((sum, q) => sum + q.rating, 0) / behavioralQuestions.length / 5) * 100)
    : 0;

  const situationalScore = situationalQuestions.length > 0
    ? Math.round((situationalQuestions.reduce((sum, q) => sum + q.rating, 0) / situationalQuestions.length / 5) * 100)
    : 0;

  const experienceScore = experienceQuestions.length > 0
    ? Math.round((experienceQuestions.reduce((sum, q) => sum + q.rating, 0) / experienceQuestions.length / 5) * 100)
    : 0;

  // Calculate consistency (how consistent are the ratings)
  const ratings = questions.map(q => q.rating);
  const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  const variance = ratings.reduce((sum, r) => sum + Math.pow(r - avgRating, 2), 0) / ratings.length;
  const consistencyScore = Math.max(0, 100 - (variance * 20)); // Lower variance = higher consistency

  // Overall match (weighted average of categories that have questions)
  const categoriesWithQuestions = [];
  if (technicalQuestions.length > 0) categoriesWithQuestions.push(technicalScore);
  if (behavioralQuestions.length > 0) categoriesWithQuestions.push(behavioralScore);
  if (situationalQuestions.length > 0) categoriesWithQuestions.push(situationalScore);
  if (experienceQuestions.length > 0) categoriesWithQuestions.push(experienceScore);
  categoriesWithQuestions.push(consistencyScore); // Always include consistency
  
  const overallMatch = categoriesWithQuestions.length > 0
    ? Math.round(categoriesWithQuestions.reduce((sum, score) => sum + score, 0) / categoriesWithQuestions.length)
    : 0;

  // Debug logging to identify issues
  console.log('Score calculation debug:', {
    technicalQuestions: technicalQuestions.length,
    behavioralQuestions: behavioralQuestions.length,
    situationalQuestions: situationalQuestions.length,
    experienceQuestions: experienceQuestions.length,
    technicalScore: technicalScore,
    behavioralScore: behavioralScore,
    situationalScore: situationalScore,
    experienceScore: experienceScore,
    consistencyScore: consistencyScore,
    overallMatch: overallMatch,
    avgRating: avgRating
  });

  // Identify strengths and weaknesses
  const highPerformance = questions.filter(q => q.rating >= 4);
  const lowPerformance = questions.filter(q => q.rating <= 2);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (technicalScore >= 80) strengths.push('Strong technical performance');
  if (behavioralScore >= 80) strengths.push('Excellent behavioral responses');
  if (situationalScore >= 80) strengths.push('Great situational judgment');
  if (experienceScore >= 80) strengths.push('Relevant experience');
  if (consistencyScore >= 80) strengths.push('Consistent performance across questions');

  if (technicalScore < 60) weaknesses.push('Technical skills need improvement');
  if (behavioralScore < 60) weaknesses.push('Behavioral responses could be stronger');
  if (situationalScore < 60) weaknesses.push('Situational judgment needs work');
  if (experienceScore < 60) weaknesses.push('Limited relevant experience demonstrated');
  if (consistencyScore < 60) weaknesses.push('Inconsistent performance across questions');

  const summary = `Candidate achieved an average rating of ${avgRating.toFixed(1)}/5.0 across ${questions.length} questions. 
    ${highPerformance.length > 0 ? `Performed well on ${highPerformance.length} questions.` : ''} 
    ${lowPerformance.length > 0 ? `Needs improvement on ${lowPerformance.length} questions.` : ''}`.trim();

  return {
    overallScore: isNaN(overallMatch) ? 0 : overallMatch,
    overallMatch: isNaN(overallMatch) ? 0 : overallMatch, // Keep both for compatibility
    technicalScore: isNaN(technicalScore) ? 0 : technicalScore,
    technical: isNaN(technicalScore) ? 0 : technicalScore, // Keep both for compatibility
    behavioralScore: isNaN(behavioralScore) ? 0 : behavioralScore,
    behavioral: isNaN(behavioralScore) ? 0 : behavioralScore, // Keep both for compatibility
    situationalScore: isNaN(situationalScore) ? 0 : situationalScore,
    situational: isNaN(situationalScore) ? 0 : situationalScore, // Keep both for compatibility
    experienceScore: isNaN(experienceScore) ? 0 : experienceScore,
    experience: isNaN(experienceScore) ? 0 : experienceScore, // Keep both for compatibility
    consistencyScore: isNaN(consistencyScore) ? 0 : Math.round(consistencyScore),
    consistency: isNaN(consistencyScore) ? 0 : Math.round(consistencyScore), // Keep both for compatibility
    averageRating: isNaN(avgRating) ? 0 : Math.round(avgRating * 20), // Convert to 0-100 scale
    strengths,
    weaknesses,
    summary,
    questionBreakdown: {
      highPerformance,
      lowPerformance
    }
  };
}
