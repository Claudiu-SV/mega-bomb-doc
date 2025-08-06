const fs = require('fs');
const path = require('path');

// Import the assessment parser
const { parseInterviewAssessmentPDF } = require('./dist/services/interviewAssessmentParser.js');

async function testParsing() {
  try {
    const uploadsDir = path.join(__dirname, 'uploads', 'assessments');
    console.log('Checking uploads directory:', uploadsDir);
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('No uploads directory found');
      return;
    }
    
    const files = fs.readdirSync(uploadsDir);
    console.log('Found files:', files);
    
    for (const file of files) {
      if (file.endsWith('.pdf')) {
        console.log(`\nTesting file: ${file}`);
        const filePath = path.join(uploadsDir, file);
        
        try {
          const result = await parseInterviewAssessmentPDF(filePath);
          console.log('Parsing result:', JSON.stringify(result, null, 2));
        } catch (error) {
          console.error(`Error parsing ${file}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

testParsing();
