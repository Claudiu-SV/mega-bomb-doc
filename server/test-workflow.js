const fs = require('fs');
const path = require('path');

// Import the assessment parser functions
const { parseInterviewAssessmentPDF, calculateCandidateScores } = require('./dist/services/interviewAssessmentParser.js');

async function testCompleteWorkflow() {
  console.log('=== Testing Complete Comparison Workflow ===\n');
  
  try {
    // Step 1: Parse uploaded PDFs
    console.log('Step 1: Parsing uploaded PDF assessments...');
    const uploadsDir = path.join(__dirname, 'uploads', 'assessments');
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));
    
    const candidates = [];
    let candidateIndex = 1;
    
    for (const file of files.slice(0, 2)) { // Take first 2 files for comparison
      const filePath = path.join(uploadsDir, file);
      console.log(`  Parsing: ${file}`);
      
      const assessment = await parseInterviewAssessmentPDF(filePath);
      
      // Create candidate structure expected by analysis endpoint
      const candidate = {
        id: `candidate-${candidateIndex}`,
        name: `Candidate ${candidateIndex}`, // Will be overridden if found in assessment
        interviewAssessment: assessment
      };
      
      // Use candidate name from assessment if available
      if (assessment.candidateName && assessment.candidateName !== 'Sample Candidate') {
        candidate.name = assessment.candidateName;
      }
      
      candidates.push(candidate);
      candidateIndex++;
    }
    
    console.log(`✅ Parsed ${candidates.length} candidate assessments\n`);
    
    // Step 2: Validate the request structure
    console.log('Step 2: Validating request structure...');
    const requestBody = {
      criteria: {
        jobTitle: 'Mobile Developer',
        experienceLevel: 'Senior',
        position: 'Flutter Developer'
      },
      candidates: candidates
    };
    
    // Manual validation check (since middleware expects Express req/res)
    console.log('  Checking criteria...');
    if (!requestBody.criteria || !requestBody.criteria.jobTitle || !requestBody.criteria.experienceLevel) {
      throw new Error('Invalid criteria');
    }
    console.log('  ✅ Criteria valid');
    
    console.log('  Checking candidates...');
    if (!requestBody.candidates || requestBody.candidates.length < 2) {
      throw new Error('Need at least 2 candidates');
    }
    console.log('  ✅ Candidate count valid');
    
    // Check each candidate
    for (let i = 0; i < requestBody.candidates.length; i++) {
      const candidate = requestBody.candidates[i];
      console.log(`  Checking candidate ${i + 1} (${candidate.name})...`);
      
      if (!candidate.id || !candidate.name) {
        throw new Error(`Candidate ${i + 1} missing id or name`);
      }
      
      if (!candidate.interviewAssessment) {
        throw new Error(`Candidate ${i + 1} missing interview assessment`);
      }
      
      const assessment = candidate.interviewAssessment;
      if (!assessment.questions || !Array.isArray(assessment.questions) || assessment.questions.length === 0) {
        throw new Error(`Candidate ${i + 1} has no interview questions`);
      }
      
      const questionsWithRatings = assessment.questions.filter(q => q.rating !== undefined && q.rating !== null);
      if (questionsWithRatings.length === 0) {
        throw new Error(`Candidate ${i + 1} has no questions with ratings`);
      }
      
      console.log(`    ✅ ${questionsWithRatings.length}/${assessment.questions.length} questions have ratings`);
    }
    
    console.log('✅ All validation checks passed\n');
    
    // Step 3: Perform analysis
    console.log('Step 3: Performing candidate analysis...');
    const analysisResults = [];
    
    for (const candidate of requestBody.candidates) {
      console.log(`  Analyzing ${candidate.name}...`);
      const scores = calculateCandidateScores(candidate.interviewAssessment);
      
      analysisResults.push({
        candidateId: candidate.id,
        candidateName: candidate.name,
        scores
      });
      
      console.log(`    Overall Score: ${scores.overallScore}%`);
      console.log(`    Technical: ${scores.technical}%, Behavioral: ${scores.behavioral}%`);
    }
    
    console.log('✅ Analysis complete\n');
    
    // Step 4: Display results
    console.log('Step 4: Comparison Results');
    console.log('========================');
    
    // Sort by overall score
    analysisResults.sort((a, b) => b.scores.overallScore - a.scores.overallScore);
    
    analysisResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.candidateName} (ID: ${result.candidateId})`);
      console.log(`   Overall Score: ${result.scores.overallScore}%`);
      console.log(`   Technical: ${result.scores.technical}%`);
      console.log(`   Behavioral: ${result.scores.behavioral}%`);
      console.log(`   Situational: ${result.scores.situational}%`);
      console.log(`   Experience: ${result.scores.experience}%`);
      console.log(`   Consistency: ${result.scores.consistency}%`);
      console.log('');
    });
    
    console.log('🎉 Complete workflow test successful!');
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
    console.error('Full error:', error);
  }
}

testCompleteWorkflow();
