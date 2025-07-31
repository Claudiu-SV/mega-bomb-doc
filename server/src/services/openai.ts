import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import type { GeneratedInterview, JobRequirements } from '../types';

// Load environment variables
const envLocalPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envLocalPath });

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
    // OpenAI client initialized
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
    
    // Handle various path formats
    let normalizedPath = resumePath;
    
    // Handle paths that start with /uploads/
    if (normalizedPath.startsWith('/uploads/')) {
      normalizedPath = normalizedPath.substring(1); // Remove leading slash
    }
    
    // Handle if only the filename was passed
    if (!normalizedPath.includes('/') && !normalizedPath.includes('\\')) {
      normalizedPath = `uploads/${normalizedPath}`;
    }
    
    const fullPath = path.join(__dirname, '../../', normalizedPath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      
      // Try alternative paths
      const alternatives = [
        path.join(__dirname, '../../../uploads', path.basename(resumePath)),
        path.join(__dirname, '../../uploads', path.basename(resumePath))
      ];
      
      let fileFound = false;
      for (const altPath of alternatives) {
        // Check alternative path
        if (fs.existsSync(altPath)) {
          // File found at alternative path
          fileFound = true;
          return getMockResumeContent(altPath);
        }
      }
      
      if (!fileFound) {
        throw new Error(`Resume file not found at path: ${fullPath} or any alternative paths`);
      }
    }
    
    return getMockResumeContent(fullPath);
  } catch (error) {
    console.error('Error extracting resume text:', error);
    throw new Error(`Failed to extract text from resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to get mock content based on file type
function getMockResumeContent(filePath: string): string {
  // Get file extension to determine how to handle it
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath);
  
  // For demo purposes, we're just returning mock content
  // In a real app, you'd use libraries like pdf-parse or mammoth for PDFs and DOCs
  if (ext === '.pdf') {
    return `
John Doe
Senior Full Stack Developer
john.doe@example.com | (555) 123-4567 | linkedin.com/in/johndoe

SUMMARY
Experienced Full Stack Developer with 5+ years of expertise in JavaScript, React, Node.js, and TypeScript. Passionate about creating efficient, scalable web applications with clean, maintainable code.

SKILLS
• Frontend: React, Redux, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, RESTful APIs, GraphQL
• Databases: MongoDB, PostgreSQL, MySQL
• Tools: Git, Docker, AWS, Jest, Webpack

EXPERIENCE
Senior Full Stack Developer | Tech Solutions Inc. | 2022 - Present
• Led development of a customer portal that improved user engagement by 35%
• Implemented CI/CD pipelines that reduced deployment time by 50%
• Mentored junior developers and conducted code reviews

Full Stack Developer | WebDev Agency | 2019 - 2022
• Developed responsive web applications using React and Node.js
• Optimized database queries resulting in 40% faster load times
• Integrated third-party APIs for payment processing and authentication

EDUCATION
B.S. Computer Science | University of Technology | 2019
`;
  } else if (ext === '.doc' || ext === '.docx') {
    return `
Emily Smith
UI/UX Designer & Frontend Developer
emily.smith@example.com | (555) 987-6543

SUMMARY
Creative UI/UX Designer and Frontend Developer with 4 years of experience creating beautiful, intuitive interfaces. Skilled in translating business requirements into user-friendly designs and implementing them with modern frontend technologies.

SKILLS
• Design: Figma, Adobe XD, Sketch, Photoshop, Illustrator
• Frontend: React, Vue.js, JavaScript, TypeScript, HTML5, CSS3/SASS
• Tools: Git, Jira, Trello, Zeplin
• Other: Responsive Design, Accessibility, User Testing

EXPERIENCE
UI/UX Designer & Frontend Developer | Creative Digital | 2021 - Present
• Redesigned company flagship product increasing user satisfaction by 45%
• Implemented component library that improved development efficiency by 30%
• Conducted user research and usability testing to inform design decisions

Frontend Developer | Web Innovations | 2019 - 2021
• Developed responsive web interfaces using React and Vue.js
• Collaborated with designers to implement pixel-perfect UI components
• Optimized frontend performance resulting in 25% faster page loads

EDUCATION
B.A. Digital Design | Design Institute | 2019
Certification in User Experience Design | UX Academy | 2020
`;
  } else {
    // For text files, read directly
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (err) {
      return `
Michael Johnson
Backend Developer
michael.johnson@example.com | (555) 456-7890

SUMMARY
Detail-oriented Backend Developer with 3+ years of experience building robust server-side applications. Specialized in API development, database optimization, and cloud infrastructure.

SKILLS
• Languages: JavaScript, TypeScript, Python, Go
• Backend: Node.js, Express, Django, FastAPI
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes, CI/CD

EXPERIENCE
Backend Developer | Cloud Systems Inc. | 2022 - Present
• Developed scalable microservices architecture handling 1M+ daily requests
• Implemented data caching strategy that reduced database load by 60%
• Created comprehensive API documentation and developer guides

Junior Developer | Tech Startups LLC | 2020 - 2022
• Built RESTful APIs for mobile and web applications
• Managed database migrations and schema updates
• Implemented automated testing increasing code coverage to 85%

EDUCATION
B.S. Computer Engineering | Tech University | 2020
AWS Certified Developer | 2021
`;
    }
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
    console.log('No valid OpenAI API key found. Using mock interview questions.');
    const mockData = generateMockInterviewQuestions(jobRequirements);
    return mockData;
  }
  
  // If we have an API key but no OpenAI client, try to initialize it
  if (!openai) {
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      // OpenAI client initialized
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
      return generateMockInterviewQuestions(jobRequirements);
    }
  }
  try {
    // Extract text from resume
    const resumeText = await extractResumeText(resumePath);
    
    // Prepare prompt for OpenAI
    const prompt = `
      Generate interview questions based on these job requirements and resume:
      JOB: ${JSON.stringify(jobRequirements)}
      RESUME: ${resumeText}
      
      GENERATE EXACTLY:
      - 2 behavioral questions about collaboration and adaptability
      - 6 experience-based questions focusing on problem-solving and innovation
      - 12 technical questions (medium/hard difficulty)
      
      IMPORTANT: For technical questions, DO NOT ask general experience questions like "Tell me about your experience with X technology." Instead, create specific problem-solving questions that test deep technical knowledge, such as:
      - "How would you implement X feature using Y technology?"
      - "What's the best approach to solve X problem in Y framework?"
      - "How would you optimize X for better performance?"
      - "Explain how you would handle X edge case in Y scenario"
      - "What architecture would you choose for X requirement and why?"
      - "How would you debug X issue in Y environment?"
      
      Technical questions should focus on:
      - Specific implementation strategies and best practices
      - Architecture and design decisions
      - Performance optimization techniques
      - Security considerations and solutions
      - Debugging and troubleshooting approaches
      - State management and data flow
      - API design and integration patterns
      - Testing strategies and methodologies
      
      For each question include:
      - Question text
      - Difficulty (Easy/Medium/Hard)
      - Category (Technical/Behavioral/Experience)
      - Evaluation criteria
      
      Format as JSON:
      {
        "questions": [
          {
            "id": "1",
            "text": "Question text",
            "difficulty": "Easy|Medium|Hard",
            "category": "Technical|Behavioral|Experience",
            "evaluationCriteria": "What to look for in a good answer"
          }
        ]
      }
      
      Sort order: behavioral, experience-based, technical.
    `;
    
    // Call OpenAI API with retry logic and error handling
    const startTime = Date.now();
    let response;
    
    try {
      response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          { role: "system", content: "You are an expert technical interviewer assistant. You must follow instructions exactly and completely. When generating questions, prioritize quality and depth, especially for technical questions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 10000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });
      
      // API call completed
    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError);
      
      // Handle specific API errors
      if (apiError.status === 429) {
        console.error('Rate limit exceeded. Using mock data as fallback.');
        return generateMockInterviewQuestions(jobRequirements);
      }
      
      if (apiError.status === 500) {
        console.error('OpenAI server error. Using mock data as fallback.');
        return generateMockInterviewQuestions(jobRequirements);
      }
      
      // For any other API error, fall back to mock data
      console.error('Unexpected API error. Using mock data as fallback.');
      return generateMockInterviewQuestions(jobRequirements);
    }
    
    // Parse the response
    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not find JSON object in response');
      // Response received
      throw new Error('Failed to parse JSON from OpenAI response: No JSON object found');
    }
    
    try {
      // First, try standard JSON parsing
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        // If standard parsing fails, attempt to fix common JSON issues
        // Attempting to fix malformed JSON
        
        // Get the raw JSON string
        let jsonString = jsonMatch[0];
        
        // Fix common JSON issues:
        // 1. Replace single quotes with double quotes for property names
        jsonString = jsonString.replace(/([{,])\s*'([^']+)'\s*:/g, '$1"$2":');
        
        // 2. Ensure property values that are strings use double quotes
        jsonString = jsonString.replace(/:\s*'([^']+)'/g, ':"$1"');
        
        // 3. Fix trailing commas in arrays and objects
        jsonString = jsonString.replace(/,\s*([\]}])/g, '$1');
        
        // Try parsing the fixed JSON
        try {
          parsedResponse = JSON.parse(jsonString);
          // Successfully fixed and parsed JSON
        } catch (secondError) {
          console.error('Failed to fix malformed JSON:', secondError);
          // JSON fix attempted
          throw new Error(`Failed to parse JSON after repair attempts: ${(secondError as Error).message}`);
        }
      }
      
      // Validate the parsed response has the expected structure
      if (!parsedResponse || !Array.isArray(parsedResponse.questions)) {
        console.error('Invalid response structure:', parsedResponse);
        throw new Error('Invalid response structure: missing questions array');
      }
      
      // Format as GeneratedInterview
      const result = {
        questions: parsedResponse.questions.map((q: any) => ({
          id: q.id || String(Math.random().toString(36).substr(2, 9)),
          text: q.text || q.question || '',
          difficulty: q.difficulty || 'Medium',
          category: q.category || 'Technical',
          evaluationCriteria: q.evaluationCriteria || ''
        }))
      };
      
      return result;
    } catch (error) {
      const parseError = error as Error;
      console.error('JSON parsing error details:', parseError);
      throw new Error(`Failed to parse JSON from OpenAI response: ${parseError.message}`);
    }
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
        text: 'Describe a situation where you had to collaborate with a difficult team member. How did you handle it?',
        difficulty: 'Medium',
        category: 'Behavioral',
        evaluationCriteria: 'Look for emotional intelligence, conflict resolution skills, and ability to maintain professional relationships despite challenges.'
      },
      {
        id: '2',
        text: 'Tell me about a time when you had to adapt to a significant change in project requirements or technology stack mid-project.',
        difficulty: 'Medium',
        category: 'Behavioral',
        evaluationCriteria: 'Assess adaptability, resilience, and ability to quickly learn and apply new concepts under pressure.'
      },
      {
        id: '3',
        text: 'Describe a project where you had to make a difficult technical decision. What was your decision-making process?',
        difficulty: 'Medium',
        category: 'Experience',
        evaluationCriteria: 'Evaluate analytical thinking, weighing of trade-offs, and ability to make sound technical decisions.'
      },
      {
        id: '4',
        text: 'Share an example of how you optimized the performance of an application. What metrics did you use and what improvements did you achieve?',
        difficulty: 'Medium',
        category: 'Experience',
        evaluationCriteria: 'Look for understanding of performance metrics, optimization techniques, and measurable results.'
      },
      {
        id: '5',
        text: 'Describe a situation where you identified and fixed a critical bug in production. What was your approach?',
        difficulty: 'Hard',
        category: 'Experience',
        evaluationCriteria: 'Assess debugging skills, problem-solving under pressure, and understanding of production environments.'
      },
      {
        id: '6',
        text: 'Tell me about a time when you had to refactor a significant portion of code. How did you approach it and what was the outcome?',
        difficulty: 'Medium',
        category: 'Experience',
        evaluationCriteria: 'Evaluate code quality awareness, refactoring strategies, and ability to improve maintainability.'
      },
      {
        id: '7',
        text: 'How would you implement a secure authentication system using JWT in a React application?',
        difficulty: 'Medium',
        category: 'Technical',
        evaluationCriteria: 'Look for understanding of JWT, secure storage methods, refresh token strategies, and protection against common vulnerabilities.'
      },
      {
        id: '8',
        text: `What's the best approach to manage global state in a large-scale ${jobRequirements.requiredSkills.includes('React') ? 'React' : 'frontend'} application? Compare different solutions and their trade-offs.`,
        difficulty: 'Hard',
        category: 'Technical',
        evaluationCriteria: 'Assess knowledge of state management libraries (Redux, Context API, MobX, Zustand, etc.), understanding of their pros and cons, and ability to choose appropriate solutions based on requirements.'
      },
      {
        id: '9',
        text: 'How would you optimize the performance of a React component that renders a large list of items?',
        difficulty: 'Medium',
        category: 'Technical',
        evaluationCriteria: 'Look for knowledge of virtualization, memoization, React.memo, useMemo, useCallback, and other optimization techniques.'
      },
      {
        id: '10',
        text: 'Explain how you would implement a CI/CD pipeline for a microservices architecture. What tools would you use and why?',
        difficulty: 'Hard',
        category: 'Technical',
        evaluationCriteria: 'Evaluate understanding of CI/CD concepts, knowledge of relevant tools (Jenkins, GitHub Actions, etc.), and awareness of microservices deployment challenges.'
      },
      {
        id: '11',
        text: 'How would you handle API rate limiting in a frontend application to prevent exceeding quota limits?',
        difficulty: 'Medium',
        category: 'Technical',
        evaluationCriteria: 'Assess knowledge of throttling, debouncing, request queuing, and retry strategies.'
      },
      {
        id: '12',
        text: 'Describe your approach to implementing accessibility features in a web application. What standards would you follow?',
        difficulty: 'Medium',
        category: 'Technical',
        evaluationCriteria: 'Look for knowledge of WCAG guidelines, semantic HTML, ARIA attributes, keyboard navigation, and testing tools for accessibility.'
      },
      {
        id: '13',
        text: 'How would you design a system to handle real-time updates from multiple sources in a web application?',
        difficulty: 'Hard',
        category: 'Technical',
        evaluationCriteria: 'Evaluate understanding of WebSockets, Server-Sent Events, long polling, and state synchronization strategies.'
      },
      {
        id: '14',
        text: 'What architecture would you choose for a mobile application that needs to work offline and sync data when online?',
        difficulty: 'Hard',
        category: 'Technical',
        evaluationCriteria: 'Assess knowledge of offline-first design, local storage options, conflict resolution strategies, and synchronization patterns.'
      },
      {
        id: '15',
        text: 'How would you implement end-to-end type safety across a full-stack TypeScript application?',
        difficulty: 'Hard',
        category: 'Technical',
        evaluationCriteria: 'Look for understanding of type sharing between frontend and backend, schema validation, code generation tools, and TypeScript best practices.'
      },
      {
        id: '16',
        text: 'Explain how you would debug a memory leak in a JavaScript application. What tools would you use?',
        difficulty: 'Hard',
        category: 'Technical',
        evaluationCriteria: 'Evaluate knowledge of browser dev tools, heap snapshots, performance profiling, common memory leak causes, and resolution strategies.'
      },
      {
        id: '17',
        text: 'How would you implement a secure file upload feature that prevents malicious file uploads?',
        difficulty: 'Medium',
        category: 'Technical',
        evaluationCriteria: 'Assess understanding of file validation, content-type verification, virus scanning, secure storage, and potential vulnerabilities.'
      },
      {
        id: '18',
        text: 'What strategies would you use to optimize the loading performance of a web application?',
        difficulty: 'Medium',
        category: 'Technical',
        evaluationCriteria: 'Look for knowledge of code splitting, lazy loading, image optimization, caching strategies, and performance metrics (Core Web Vitals).'
      }
    ]
  };
}
