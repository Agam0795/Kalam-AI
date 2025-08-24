import { NextRequest, NextResponse } from 'next/server';
import { linguisticPersonaEmulator, LinguisticFingerprint } from '@/lib/advancedStyleAnalyzer';

export async function POST(request: NextRequest) {
  try {
    const { text, analysisType = 'full' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required for analysis' },
        { status: 400 }
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        { error: 'Text must be at least 100 characters long for meaningful linguistic analysis' },
        { status: 400 }
      );
    }

    // Perform advanced linguistic fingerprint analysis
    const linguisticFingerprint: LinguisticFingerprint = linguisticPersonaEmulator.createLinguisticFingerprint(text);

    // Generate AI prompt for persona emulation
    const personaPrompt = linguisticPersonaEmulator.generatePersonaPrompt(
      linguisticFingerprint, 
      "Write a sample paragraph to demonstrate the author's style"
    );

    // Add additional metadata
    const response = {
      linguisticFingerprint,
      personaPrompt,
      metadata: {
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        paragraphCount: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
        analysisTimestamp: new Date().toISOString(),
        analysisType
      },
      recommendations: generateAdvancedRecommendations(linguisticFingerprint),
      styleSummary: generateStyleSummary(linguisticFingerprint)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Advanced style analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text style with linguistic persona emulator' },
      { status: 500 }
    );
  }
}

function generateAdvancedRecommendations(fingerprint: LinguisticFingerprint): string[] {
  const recommendations: string[] = [];

  // Vocabulary recommendations
  if (fingerprint.vocabularyRichness === 'simple') {
    recommendations.push('Consider incorporating more sophisticated vocabulary to enhance expressiveness');
  }

  // Sentence structure recommendations
  if (fingerprint.avgSentenceLength > 30) {
    recommendations.push('Some sentences are quite long - consider breaking them down for clarity');
  } else if (fingerprint.avgSentenceLength < 10) {
    recommendations.push('Sentences are quite short - try varying length for better flow');
  }

  // Formality recommendations
  if (fingerprint.formalityLevel === 'informal' && fingerprint.vocabularyRichness === 'academic') {
    recommendations.push('There\'s a mismatch between informal tone and academic vocabulary');
  }

  // Contractions recommendation
  if (!fingerprint.contractionsUsage && fingerprint.formalityLevel === 'informal') {
    recommendations.push('Consider using contractions to match the informal tone');
  }

  // Punctuation recommendations
  if (fingerprint.punctuationHabits.includes('Heavy use of commas')) {
    recommendations.push('Review comma usage - some sentences might be overly complex');
  }

  // Readability recommendation
  if (fingerprint.readabilityScore < 30) {
    recommendations.push('Text complexity is very high - consider simplifying for broader accessibility');
  }

  return recommendations.length > 0 ? recommendations : ['Writing style appears well-balanced'];
}

function generateStyleSummary(fingerprint: LinguisticFingerprint): string {
  const characteristics: string[] = [];

  // Add key characteristics
  characteristics.push(`${fingerprint.vocabularyRichness} vocabulary`);
  characteristics.push(`${fingerprint.formalityLevel} tone`);
  characteristics.push(`${fingerprint.sentenceVariety} sentence variety`);
  characteristics.push(`${fingerprint.informationPacing} information pacing`);

  if (fingerprint.contractionsUsage) {
    characteristics.push('uses contractions');
  }

  if (fingerprint.rhetoricalDevices.length > 0) {
    characteristics.push(`employs ${fingerprint.rhetoricalDevices.slice(0, 2).join(' and ')}`);
  }

  return `This author demonstrates ${characteristics.join(', ')} with ${fingerprint.tone} mood and ${fingerprint.logicalFlow} reasoning patterns.`;
}
