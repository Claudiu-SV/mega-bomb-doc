const { validateCandidatesForAnalysis } = require('./dist/middleware/validation.js');

async function testValidation() {
  console.log('=== Testing Validation Logic ===\n');
  
  // Test 1: Valid candidates
  console.log('Test 1: Valid candidates with ratings...');
  const validCandidates = [
    {
      name: 'John Doe',
      file: { originalname: 'john_assessment.pdf' },
      assessment: {
        candidateName: 'John Doe',
        questions: [
          { id: 'Q1', question: 'Technical question', rating: 4, maxRating: 5, category: 'technical' },
          { id: 'Q2', question: 'Behavioral question', rating: 3, maxRating: 5, category: 'behavioral' }
        ]
      }
    },
    {
      name: 'Jane Smith',
      file: { originalname: 'jane_assessment.pdf' },
      assessment: {
        candidateName: 'Jane Smith',
        questions: [
          { id: 'Q1', question: 'Technical question', rating: 5, maxRating: 5, category: 'technical' },
          { id: 'Q2', question: 'Behavioral question', rating: 4, maxRating: 5, category: 'behavioral' }
        ]
      }
    }
  ];
  
  try {
    const result1 = validateCandidatesForAnalysis(validCandidates);
    console.log('✅ Result:', result1 ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  // Test 2: Invalid candidates (no ratings)
  console.log('\nTest 2: Invalid candidates without ratings...');
  const invalidCandidates = [
    {
      name: 'Bad Candidate',
      file: { originalname: 'bad_assessment.pdf' },
      assessment: {
        candidateName: 'Bad Candidate',
        questions: [
          { id: 'Q1', question: 'Question without rating' }
        ]
      }
    }
  ];
  
  try {
    const result2 = validateCandidatesForAnalysis(invalidCandidates);
    console.log('✅ Result:', result2 ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  // Test 3: Empty candidates array
  console.log('\nTest 3: Empty candidates array...');
  try {
    const result3 = validateCandidatesForAnalysis([]);
    console.log('✅ Result:', result3 ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n=== Validation Tests Complete ===');
}

testValidation();
