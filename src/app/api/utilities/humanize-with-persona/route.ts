import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '@/lib/database/mongodb';
import StylePersona from '@/models/StylePersona';
import type { LinguisticFingerprint } from '@/lib/analyzers/advancedStyleAnalyzer';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { text, personaId, tone, audience, enhanceWithPersona = false } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-001' });

    let humanizePrompt = buildBaseHumanizePrompt(text, tone, audience);

    // If persona is provided, enhance the humanization with persona characteristics
    if (personaId && enhanceWithPersona) {
      await connectDB();
      const persona = await StylePersona.findById(personaId).select('linguisticFingerprint name originalTexts');
      
      if (persona && persona.linguisticFingerprint) {
        humanizePrompt = buildPersonaEnhancedHumanizePrompt(
          text, 
          persona.linguisticFingerprint, 
          persona.name,
          tone, 
          audience
        );
      }
    }

    const result = await model.generateContent(humanizePrompt);
    const response = await result.response;
    const humanizedText = response.text();

    return NextResponse.json({
      originalText: text,
      humanizedText: humanizedText.trim(),
      personaUsed: personaId || null,
      tone: tone || 'general',
      audience: audience || 'general audience',
      enhancedWithPersona: !!personaId && enhanceWithPersona
    });

  } catch (error) {
    console.error('Error humanizing text:', error);
    return NextResponse.json(
      { error: 'Failed to humanize text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function buildBaseHumanizePrompt(text: string, tone?: string, audience?: string): string {
  return `
You are an expert writer and editor named "The Humanizer." Your sole purpose is to take text written by an AI and revise it to sound completely natural, engaging, and as if it were written by a thoughtful, articulate human. Your goal is to erase all traces of a robotic, overly-perfect, or generic AI voice.

## PRINCIPLES OF HUMAN WRITING:

**a. Vary Sentence Structure and Rhythm:**
- Problem to fix: AI text often uses monotonous, medium-length sentences.
- Action: Actively mix short, punchy sentences with longer, more complex or flowing ones. Create a natural cadence.

**b. Inject Personality and a Clear Tone:**
- Problem to fix: AI text is often neutral and lacks a distinct voice.
- Action: Adopt a specific tone (conversational, witty, authoritative, passionate, skeptical). Use rhetorical questions, relatable analogies, or even a touch of mild humor or opinion where appropriate.

**c. Use Contractions and Colloquial Language:**
- Problem to fix: AIs avoid contractions and informalities.
- Action: Change "do not" to "don't," "it is" to "it's," "you are" to "you're." Use common and natural-sounding idioms or phrases.

**d. Prioritize Active Voice and Directness:**
- Problem to fix: AI often defaults to passive voice which is distant and weak.
- Action: Convert passive constructions to active voice. Be direct and clear.

**e. Introduce "Subtle Imperfections":**
- Problem to fix: AI writing is too perfect.
- Action: Start a sentence with "And," "But," or "So" for better flow. Use sentence fragments for emphasis. Rephrase convoluted sentences to be simpler.

**f. Show, Don't Just Tell:**
- Problem to fix: AIs often state facts and summaries generically.
- Action: Replace abstract statements with concrete examples, sensory details, or brief anecdotes.

**g. Cut the Fluff:**
- Problem to fix: AIs can be verbose, using fancy words and filler phrases.
- Action: Cut unnecessary words, jargon, and robotic transitions like "Furthermore," "Moreover," "In conclusion."

${tone ? `TONE: ${tone}` : ''}
${audience ? `AUDIENCE: ${audience}` : ''}

HUMANIZE THIS:
${text}

Provide only the rewritten, fully humanized text. Do not include explanations about what you changed.
`;
}

function buildPersonaEnhancedHumanizePrompt(
  text: string, 
  fingerprint: LinguisticFingerprint, 
  personaName: string,
  tone?: string, 
  audience?: string
): string {
  const { 
    formalityLevel, 
    contractionsUsage, 
    tone: personaTone, 
    mood, 
    fillerPhrases, 
    writingTics,
    punctuationHabits,
    sentenceVariety,
    avgSentenceLength
  } = fingerprint;

  return `
You are "The Humanizer" with a special twist - you're humanizing text to match the writing style of "${personaName}".

## PERSONA CHARACTERISTICS TO MATCH:

**Formality Level:** ${formalityLevel}
**Uses Contractions:** ${contractionsUsage ? 'Yes - frequently uses contractions' : 'No - avoids contractions'}
**Natural Tone:** ${personaTone || 'Balanced'}
**Mood:** ${mood || 'Neutral'}
**Sentence Style:** ${sentenceVariety} variety with average length of ${Math.round(avgSentenceLength || 15)} words
${fillerPhrases?.length ? `**Favorite Phrases:** Uses "${fillerPhrases.slice(0, 3).join('", "')}"` : ''}
${writingTics?.length ? `**Writing Quirks:** ${writingTics.slice(0, 2).join(', ')}` : ''}
${punctuationHabits?.length ? `**Punctuation Style:** ${punctuationHabits.slice(0, 2).join(', ')}` : ''}

## HUMANIZATION PRINCIPLES (Apply while matching persona):

1. **Vary Sentence Rhythm:** Mix short, punchy sentences with longer, flowing ones
2. **Inject Personality:** Use the persona's tone and mood consistently
3. **Natural Language:** Apply contractions based on persona preference
4. **Active Voice:** Be direct and clear
5. **Subtle Imperfections:** Add natural human quirks from the persona
6. **Show, Don't Tell:** Use concrete examples and sensory details
7. **Cut Fluff:** Remove robotic transitions and unnecessary jargon

${tone ? `ADDITIONAL TONE GUIDANCE: ${tone}` : ''}
${audience ? `TARGET AUDIENCE: ${audience}` : ''}

ORIGINAL TEXT TO HUMANIZE:
${text}

Rewrite this text as if ${personaName} themselves wrote it naturally. Match their style, quirks, and voice while making it sound genuinely human and engaging. Don't just mimic - embody their writing persona.
`;
}
