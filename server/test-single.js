const { parseInterviewAssessmentPDF } = require('./dist/services/interviewAssessmentParser.js');

async function testSinglePDF() {
  try {
    console.log('Testing enhanced PDF parser...');
    const result = await parseInterviewAssessmentPDF('uploads/assessments/assessment-unknown-1754388545141-742010471.pdf');
    console.log('Success! Extracted assessment:', {
      candidateName: result.candidateName,
      jobTitle: result.jobTitle,
      questionsFound: result.questions.length,
      averageRating: result.averageRating
    });
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testSinglePDF();
