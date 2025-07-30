import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { GeneratedInterview, JobRequirements } from '../types';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
let openai: OpenAI;

try {
  // Check if API key is available
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.warn('Warning: OpenAI API key is not set. Using mock data for development.');
    // We'll handle this case in the generateInterviewQuestions function
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  // We'll handle this case in the generateInterviewQuestions function
}

/**
 * Extract text content from a resume file
 * In a production app, you would use a proper parser for different file types
 * This is a simplified version that assumes text files for demo purposes
 */
async function extractResumeText(resumePath: string): Promise<string> {
  try {
    const fullPath = path.join(__dirname, '../../', resumePath);
    
    // For demo purposes, we're just reading the file as text
    // In a real app, you'd use libraries like pdf-parse or mammoth for PDFs and DOCs
    const content = fs.readFileSync(fullPath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error extracting resume text:', error);
    throw new Error('Failed to extract text from resume');
  }
}

/**
 * Generate interview questions based on job requirements and resume
 */
export async function generateInterviewQuestions(
  jobRequirements: JobRequirements,
  resumePath: string
): Promise<GeneratedInterview> {
  // Check if we're in development mode without an API key
  const useMockData = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here';
  
  if (useMockData) {
    console.log('Using mock data for interview questions');
    return generateMockInterviewQuestions(jobRequirements);
  }
  try {
    // Extract text from resume
    const resumeText = await extractResumeText(resumePath);
    
    // Prepare prompt for OpenAI
    const prompt = `
      You are an expert technical interviewer. Generate interview questions based on the following:
      
      JOB REQUIREMENTS:
      ${JSON.stringify(jobRequirements)}
      
      CANDIDATE RESUME:
      ${resumeText}
      
      Generate a set of interview questions that will help assess if this candidate is a good fit for the role.
      Include a mix of technical questions, behavioral questions, and questions specific to their experience.
      For each question, include:
      1. The question text
      2. What skill or qualification it tests
      3. A difficulty rating (Easy, Medium, Hard)
      4. The category (Technical, Behavioral, Experience)
      5. What to look for in a good answer
      
      Format your response as a JSON object with the following structure:
      {
        "questions": [
          {
            "id": "1",
            "text": "Question text",
            "skill": "Skill being tested",
            "difficulty": "Easy|Medium|Hard",
            "category": "Technical|Behavioral|Experience",
            "evaluationCriteria": "What to look for in a good answer"
          }
        ]
      }
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert technical interviewer assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    // Parse the response
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from OpenAI response');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // Format as GeneratedInterview
    return {
      questions: parsedResponse.questions.map((q: any) => ({
        id: q.id,
        text: q.text,
        skill: q.skill,
        difficulty: q.difficulty,
        category: q.category,
        evaluationCriteria: q.evaluationCriteria
      }))
    };
  } catch (error) {
    console.error('Error generating interview questions:', error);
    // Fallback to mock data in case of API error
    return generateMockInterviewQuestions(jobRequirements);
  }
}

/**
 * Generate mock interview questions for development without an API key
 */
function generateMockInterviewQuestions(jobRequirements: JobRequirements): GeneratedInterview {
  console.log('Generating mock interview questions for:', jobRequirements.title);
  
  return {
    questions: [
      {
        id: '1',
        text: `Tell me about your experience with ${jobRequirements.requiredSkills[0] || 'web development'}.`,
        skill: jobRequirements.requiredSkills[0] || 'Technical Skills',
        difficulty: 'Medium',
        category: 'Technical',
        evaluationCriteria: 'Look for depth of knowledge and practical experience.'
      },
      {
        id: '2',
        text: 'Describe a challenging project you worked on and how you overcame obstacles.',
        skill: 'Problem Solving',
        difficulty: 'Medium',
        category: 'Behavioral',
        evaluationCriteria: 'Assess problem-solving approach and resilience.'
      },
      {
        id: '3',
        text: 'How do you stay updated with the latest technologies in your field?',
        skill: 'Continuous Learning',
        difficulty: 'Easy',
        category: 'Behavioral',
        evaluationCriteria: 'Look for commitment to professional development.'
      },
      {
        id: '4',
        text: `What experience do you have with ${jobRequirements.requiredSkills[1] || 'team collaboration'}?`,
        skill: jobRequirements.requiredSkills[1] || 'Teamwork',
        difficulty: 'Medium',
        category: 'Experience',
        evaluationCriteria: 'Evaluate teamwork and collaboration skills.'
      },
      {
        id: '5',
        text: 'Explain how you would approach a complex technical problem with limited documentation.',
        skill: 'Technical Problem Solving',
        difficulty: 'Hard',
        category: 'Technical',
        evaluationCriteria: 'Assess analytical thinking and resourcefulness.'
      }
    ]
  };
}
