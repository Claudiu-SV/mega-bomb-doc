const pdfParse = require('pdf-parse');
const fs = require('fs');

async function debugPDF() {
  try {
    const dataBuffer = fs.readFileSync('uploads/assessments/assessment-unknown-1754388545141-742010471.pdf');
    console.log('PDF file size:', dataBuffer.length, 'bytes');
    
    // Try different parsing options
    console.log('\n=== Attempting different pdf-parse options ===');
    
    // Default parsing
    const pdfData1 = await pdfParse(dataBuffer);
    console.log('Default parsing:');
    console.log('- Pages:', pdfData1.numpages);
    console.log('- Text length:', pdfData1.text.length);
    console.log('- Info:', JSON.stringify(pdfData1.info, null, 2));
    
    // Try with different options
    const pdfData2 = await pdfParse(dataBuffer, { max: 0 });
    console.log('\nWith max:0 option:');
    console.log('- Text length:', pdfData2.text.length);
    
    // Check if it's a rendering issue
    console.log('\n=== Text Analysis ===');
    const text = pdfData1.text;
    console.log('Character codes of first 50 chars:');
    for (let i = 0; i < Math.min(50, text.length); i++) {
      console.log(`Char ${i}: '${text[i]}' (code: ${text.charCodeAt(i)})`);
    }
    
    // Try to find any actual content
    const lines = text.split('\n');
    console.log('\nTotal lines:', lines.length);
    console.log('Non-empty lines:');
    lines.forEach((line, i) => {
      if (line.trim().length > 0) {
        console.log(`Line ${i}: '${line}'`);
      }
    });
    
    // Try alternative parsing with different options
    console.log('\n=== Trying alternative options ===');
    try {
      const pdfData3 = await pdfParse(dataBuffer, {
        normalizeWhitespace: false,
        disableCombineTextItems: false
      });
      console.log('Alternative parsing text length:', pdfData3.text.length);
      if (pdfData3.text.length > text.length) {
        console.log('Alternative parsing found more text!');
        console.log('First 200 chars:', JSON.stringify(pdfData3.text.substring(0, 200)));
      }
    } catch (altError) {
      console.log('Alternative parsing failed:', altError.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugPDF();
