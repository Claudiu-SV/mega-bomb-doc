const { parseInterviewAssessmentPDF } = require('./dist/services/interviewAssessmentParser.js');
const fs = require('fs');
const path = require('path');

async function testRealPDFParsing() {
  console.log('=== Testing Real PDF Content Parsing ===\n');
  
  // Test with existing uploaded files
  const uploadsDir = path.join(__dirname, 'uploads', 'assessments');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found. Upload some assessment PDFs first.');
    return;
  }
  
  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log('No PDF files found in uploads directory.');
    return;
  }
  
  console.log(`Found ${files.length} PDF files to test:`);
  files.forEach(file => console.log(`  - ${file}`));
  console.log('');
  
  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    console.log(`Testing: ${file}`);
    console.log('=' + '='.repeat(file.length + 9));
    
    try {
      const assessment = await parseInterviewAssessmentPDF(filePath);
      
      console.log('✅ Successfully parsed assessment:');
      console.log(`   Candidate: ${assessment.candidateName}`);
      console.log(`   Job Title: ${assessment.jobTitle}`);
      console.log(`   Department: ${assessment.department}`);
      console.log(`   Experience Level: ${assessment.experienceLevel}`);
      console.log(`   Required Skills: ${assessment.requiredSkills.join(', ')}`);
      console.log(`   Questions Found: ${assessment.questions.length}`);
      console.log(`   Average Rating: ${assessment.averageRating}`);
      console.log(`   Category Breakdown:`, assessment.categoryBreakdown);
      
      if (assessment.questions.length > 0) {
        console.log('\n   Sample Questions:');
        assessment.questions.slice(0, 3).forEach((q, i) => {
          console.log(`   ${i + 1}. ${q.question.substring(0, 60)}...`);
          console.log(`      Category: ${q.category}, Rating: ${q.rating}/5`);
        });
      }
      
    } catch (error) {
      console.log('❌ Error parsing PDF:', error.message);
      
      if (error.message.includes('empty or too short')) {
        console.log('   This suggests the PDF has no readable text content.');
        console.log('   Please ensure you upload actual Interview Assessment PDFs with text.');
      } else if (error.message.includes('No valid interview questions')) {
        console.log('   The PDF was readable but contains no recognizable interview questions.');
        console.log('   Please check the PDF format and content structure.');
      }
    }
    
    console.log('\n');
  }
  
  console.log('=== Real PDF Parsing Test Complete ===');
  console.log('\nNote: The parser now requires real PDF content and will not use mock data.');
  console.log('Please upload actual Interview Assessment PDFs with readable text content.');
}

testRealPDFParsing();
