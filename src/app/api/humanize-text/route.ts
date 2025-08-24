import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    console.log('Humanize-text API called');
    const { text, tone, audience } = await request.json();
    console.log('Request data:', { textLength: text?.length, tone, audience });

    if (!text) {
      console.log('No text provided');
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.log('No Google API key found');
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    console.log('Initializing Google AI model...');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // The Humanizer prompt based on your specifications
    const humanizePrompt = `
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

    console.log('Generating humanized content...');
    const result = await model.generateContent(humanizePrompt);
    const response = await result.response;
    const humanizedText = response.text();

    console.log('Humanization successful, text length:', humanizedText.length);

    return NextResponse.json({
      originalText: text,
      humanizedText: humanizedText.trim(),
      tone: tone || 'general',
      audience: audience || 'general audience'
    });

  } catch (error) {
    console.error('Error humanizing text:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Handle specific Google AI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key configuration' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to humanize text', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
