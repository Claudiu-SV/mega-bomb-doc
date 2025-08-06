const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import comparison route
const comparisonRoutes = require('./dist/routes/comparison.js');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Test the comparison routes
app.use('/api/comparison', comparisonRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('You can now test the comparison functionality:');
  console.log(`- Upload assessments: POST http://localhost:${PORT}/api/comparison/upload`);
  console.log(`- Analyze candidates: POST http://localhost:${PORT}/api/comparison/analyze`);
  
  // Test the validation
  testValidation();
});

async function testValidation() {
  console.log('\n--- Testing Validation ---');
  
  // Import validation middleware
  const { validateCandidatesForAnalysis } = require('./dist/middleware/validation.js');
  
  // Create test candidates with mock data
  const testCandidates = [
    {
      name: 'John Doe',
      file: { originalname: 'john_assessment.pdf' },
      assessment: {
        candidateName: 'John Doe',
        questions: [
          { id: 'Q1', question: 'Test question', rating: 4, maxRating: 5 },
          { id: 'Q2', question: 'Another question', rating: 3, maxRating: 5 }
        ]
      }
    },
    {
      name: 'Jane Smith',
      file: { originalname: 'jane_assessment.pdf' },
      assessment: {
        candidateName: 'Jane Smith',
        questions: [
          { id: 'Q1', question: 'Test question', rating: 5, maxRating: 5 },
          { id: 'Q2', question: 'Another question', rating: 4, maxRating: 5 }
        ]
      }
    }
  ];
  
  try {
    console.log('Testing validation with valid candidates...');
    const isValid = validateCandidatesForAnalysis(testCandidates);
    console.log('Validation result:', isValid ? 'PASSED' : 'FAILED');
    
    if (isValid) {
      console.log('✅ Validation successful! Candidates are ready for analysis.');
    }
  } catch (error) {
    console.error('❌ Validation error:', error.message);
  }
}
