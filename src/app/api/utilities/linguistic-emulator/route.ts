import { NextRequest, NextResponse } from 'next/server';
import { linguisticPersonaEmulator, LinguisticFingerprint } from '@/lib/analyzers/advancedStyleAnalyzer';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { text, task, generateSample = false } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required for linguistic analysis' },
        { status: 400 }
      );
    }

    if (text.length < 200) {
      return NextResponse.json(
        { error: 'Text must be at least 200 characters long for robust linguistic fingerprinting' },
        { status: 400 }
      );
    }

    // Step 1: Create linguistic fingerprint
    console.log('Creating linguistic fingerprint...');
    const linguisticFingerprint: LinguisticFingerprint = linguisticPersonaEmulator.createLinguisticFingerprint(text);

    // Step 2: Generate persona emulation prompt
    const taskPrompt = task || "Write a paragraph explaining the importance of clear communication in professional settings.";
    const personaPrompt = linguisticPersonaEmulator.generatePersonaPrompt(linguisticFingerprint, taskPrompt);

    let sampleGeneration = null;

    // Step 3: Optionally generate a sample using the persona
    if (generateSample && process.env.GOOGLE_API_KEY) {
      try {
        console.log('Generating sample text using persona...');
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(personaPrompt);
        sampleGeneration = result.response.text();
      } catch (error) {
        console.error('Error generating sample:', error);
        sampleGeneration = 'Sample generation failed';
      }
    }

    const response = {
      status: 'Analysis complete. Linguistic fingerprint created.',
      linguisticFingerprint,
      personaPrompt,
      sampleGeneration,
      analysisMetadata: {
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        paragraphCount: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
        analysisTimestamp: new Date().toISOString(),
      },
      keyInsights: generateKeyInsights(linguisticFingerprint),
      personaCharacterization: generatePersonaCharacterization(linguisticFingerprint)
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Linguistic persona emulator error:', error);
    return NextResponse.json(
      { error: 'Failed to create linguistic fingerprint' },
      { status: 500 }
    );
  }
}

function generateKeyInsights(fingerprint: LinguisticFingerprint): string[] {
  const insights: string[] = [];

  // Vocabulary insights
  if (fingerprint.vocabularyRichness === 'academic' && fingerprint.domainJargon.length > 5) {
    insights.push(`Highly specialized vocabulary with ${fingerprint.domainJargon.length} domain-specific terms`);
  }

  // Sentence structure insights
  if (fingerprint.complexityDistribution.complex > 0.4) {
    insights.push('Favors complex sentence structures with multiple clauses');
  }

  // Rhetorical insights
  if (fingerprint.rhetoricalDevices.length > 2) {
    insights.push(`Employs varied rhetorical devices: ${fingerprint.rhetoricalDevices.join(', ')}`);
  }

  // Personality insights
  if (fingerprint.contractionsUsage && fingerprint.formalityLevel !== 'academic') {
    insights.push('Uses contractions for a more conversational, approachable tone');
  }

  // Idiosyncratic insights
  if (fingerprint.fillerPhrases.length > 0) {
    insights.push(`Has characteristic filler phrases: "${fingerprint.fillerPhrases.join('", "')}"`)
  }

  return insights;
}

function generatePersonaCharacterization(fingerprint: LinguisticFingerprint): string {
  const traits: string[] = [];

  // Writing sophistication
  if (fingerprint.vocabularyRichness === 'academic') {
    traits.push('intellectually rigorous');
  } else if (fingerprint.vocabularyRichness === 'complex') {
    traits.push('articulate and well-educated');
  }

  // Communication style
  if (fingerprint.informationPacing === 'dense') {
    traits.push('information-dense communicator');
  } else if (fingerprint.informationPacing === 'deliberate') {
    traits.push('methodical and deliberate');
  }

  // Personality markers
  if (fingerprint.tone === 'optimistic') {
    traits.push('positive and forward-looking');
  } else if (fingerprint.tone === 'critical') {
    traits.push('analytical and discerning');
  }

  // Structural preferences
  if (fingerprint.logicalFlow === 'deductive') {
    traits.push('systematic thinker who builds arguments logically');
  } else if (fingerprint.logicalFlow === 'inductive') {
    traits.push('evidence-based reasoner who builds from specifics');
  }

  const characterization = traits.length > 0 
    ? `This author appears to be an ${traits.join(', ')} writer`
    : 'This author demonstrates a balanced and adaptable writing style';

  return `${characterization} with ${fingerprint.formalityLevel} language patterns and ${fingerprint.sentenceVariety} sentence construction.`;
}
