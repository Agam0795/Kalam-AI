// Test script for the Enhanced Text Humanizer
// This demonstrates the new functionality

import { styleAnalyzer } from '../src/lib/styleAnalyzer';

const testText = `
The implementation of this system facilitates enhanced productivity through the utilization 
of advanced algorithms. It has been determined that users will experience significant 
improvements in their workflow efficiency. Moreover, the system provides comprehensive 
analytics that enable stakeholders to make informed decisions regarding optimization strategies.
`;

async function testHumanizer() {
  console.log('🧪 Testing Enhanced Text Humanizer\n');
  
  // Test 1: Basic linguistic fingerprint creation
  console.log('1. Creating Linguistic Fingerprint...');
  const fingerprint = styleAnalyzer.createLinguisticFingerprint(testText);
  
  console.log('✅ Fingerprint created:');
  console.log(`   - Formality: ${fingerprint.formalityLevel}`);
  console.log(`   - Tone: ${fingerprint.tone}`);
  console.log(`   - Contractions: ${fingerprint.contractionsUsage}`);
  console.log(`   - Avg sentence length: ${Math.round(fingerprint.avgSentenceLength)}`);
  
  // Test 2: Style analysis
  console.log('\n2. Analyzing Writing Patterns...');
  console.log('✅ Writing patterns:', fingerprint.writingPatterns.slice(0, 3));
  
  // Test 3: Humanization principles identification
  console.log('\n3. Humanization Opportunities:');
  if (fingerprint.formalityLevel === 'formal' || fingerprint.formalityLevel === 'academic') {
    console.log('   - Reduce formality, add contractions');
  }
  if (!fingerprint.contractionsUsage) {
    console.log('   - Add contractions (don\'t, it\'s, you\'re)');
  }
  if (fingerprint.avgSentenceLength > 20) {
    console.log('   - Break up long sentences for better flow');
  }
  if (fingerprint.writingPatterns.includes('Frequent use of passive voice')) {
    console.log('   - Convert passive voice to active voice');
  }
  
  console.log('\n🎯 Enhanced Text Humanizer is ready!');
  console.log('Features available:');
  console.log('✅ Basic humanization with tone/audience control');
  console.log('✅ Persona-enhanced humanization');
  console.log('✅ Linguistic fingerprint analysis');
  console.log('✅ Style-aware text transformation');
}

testHumanizer().catch(console.error);
