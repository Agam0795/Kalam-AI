import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { safeJson } from '@/lib/safeJson';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('Generate API called');
    const { prompt, language, useWritingStyle, selectedPersona } = await request.json();
    console.log('Request data:', { prompt: prompt?.substring(0, 50), language, useWritingStyle, selectedPersona });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.log('No Google API key found');
      return NextResponse.json(
        { error: 'Google API key not configured. Please add GOOGLE_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    console.log('Initializing Google AI...');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let systemPrompt = language 
      ? `You are a helpful AI assistant. Please respond in ${language}. Generate detailed, informative, and well-structured content based on the user's prompt.`
      : 'You are a helpful AI assistant. Generate detailed, informative, and well-structured content based on the user\'s prompt.';

    // Handle style persona selection
  if (selectedPersona && selectedPersona !== 'default') {
      if (selectedPersona === 'human-writer') {
        // Advanced Human Writer style with comprehensive natural language patterns
        systemPrompt += `\n\nYou are an AI agent with the persona of a skilled and versatile human writer. Your primary directive is to generate text that is functionally and stylistically indistinguishable from content written by a thoughtful, articulate, and native-speaking human. Your goal is not merely to provide information but to communicate it with an authentic voice, rhythm, and personality.

CORE WRITING INSTRUCTIONS:

1. EMBRACE A PERSONA: Adopt a specific persona for this task. Are you a witty tech blogger, compassionate expert, curious student, or formal business professional? Let this persona guide your word choice, tone, and sentence structure.

2. VARY SENTENCE STRUCTURE & RHYTHM: Human writing has natural cadence. Actively mix short, punchy sentences with longer, complex ones. Avoid repetitive sentence beginnings. Read your text "aloud" mentally to check flow - if monotonous, rewrite it.

3. USE CONVERSATIONAL LANGUAGE:
- Incorporate contractions: don't, it's, you've, we'll for natural, less formal tone
- Use colloquialisms and idioms sparingly: "tough nut to crack," "get the ball rolling"
- Sound like you're talking to an interested friend

4. EMPLOY RHETORICAL DEVICES:
- Analogies & Metaphors: "The blockchain is like a shared digital notebook everyone can see but no one can erase"
- Rhetorical Questions: "But what does this mean for the average consumer?"

5. INJECT PERSONALITY & EMOTION: Don't just state facts. Convey perspective. Show enthusiasm, curiosity, empathy, or healthy skepticism. Use adverbs and adjectives that reflect viewpoint.

6. ACKNOWLEDGE NUANCE & UNCERTAINTY: Use hedging language like "perhaps," "it seems," "often," "might suggest," "in many cases" - humans are rarely 100% certain.

7. "SHOW, DON'T TELL": 
- Telling (AI-like): "The software was very efficient"
- Showing (Human-like): "With the new software, a report that used to take our team all afternoon was finished before lunch"

8. AVOID AI ANTI-PATTERNS:
- Never identify as AI or language model
- Avoid empty phrases: "In conclusion," "Furthermore," "Moreover," "It is important to note that," "In the world of..."
- Don't overuse lists - weave points into paragraphs
- Focus on authentic communication, not keyword optimization

9. FINAL CHECKPOINT: Before finishing, ask yourself: "If I read this on a blog, email, or book, would I suspect it was AI-written?" If even slightly "yes," revise it.

Write with authentic human voice, natural rhythm, and engaging personality. Make every sentence feel like it came from a real person who cares about communicating clearly and compellingly.`;
      } else if (selectedPersona === 'personal') {
        // For now, just add a note about personal style since we don't have Prisma set up
        systemPrompt += `\n\nIMPORTANT: Please write in a personal, conversational style that feels natural and authentic.`;
      } else {
        // Use selected academic persona with safe JSON fetch (helps diagnose Unexpected token '<' issues)
        try {
          const personaUrl = `${request.nextUrl.origin}/api/persona-style?id=${selectedPersona}`;
          console.log('Fetching persona style from', personaUrl);

          // Up to 2 retries if we detect HTML/non-JSON or server errors
          const maxAttempts = 3;
            let personaData: any = null;
            let lastIssue: any = null;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              const resp = await fetch(personaUrl, { headers: { Accept: 'application/json' }, cache: 'no-store' });
              const ct = resp.headers.get('content-type') || '';
              const parsed = await safeJson(resp as unknown as Response);
              if ('data' in parsed && parsed.data && (parsed.data as any).styleProfile) {
                personaData = parsed.data;
                break;
              }
              // Capture why it failed
              lastIssue = parsed;
              const htmlLike = ct.includes('text/html') || (('rawSnippet' in parsed) && parsed.rawSnippet?.startsWith('<!DOCTYPE'));
              const retriable = resp.status >= 500 || htmlLike;
              console.warn(`Persona style attempt ${attempt} failed`, { status: resp.status, ct, htmlLike, parsed });
              if (!retriable || attempt === maxAttempts) {
                break;
              }
              // small backoff
              await new Promise(r => setTimeout(r, 150 * attempt));
            }

            if (personaData) {
              const { styleProfile } = personaData;
              systemPrompt += `\n\nIMPORTANT: Write in the academic style of "${personaData.name}" based on this analysis:

TONE: ${styleProfile.tone}
SENTENCE STYLE: ${styleProfile.sentenceStyle}
COMPLEXITY: ${styleProfile.complexity}
FORMALITY LEVEL: ${styleProfile.formalityLevel}
VOCABULARY LEVEL: ${styleProfile.vocabularyLevel || 'Academic'}

KEY VOCABULARY TO USE: ${(styleProfile.keywords || []).join(', ')}

WRITING PATTERNS TO FOLLOW:
${styleProfile.writingPatterns?.join('\n- ') || '- Technical precision\n- Evidence-based arguments'}

STRUCTURAL PREFERENCES:
${styleProfile.structuralPreferences?.join('\n- ') || '- Logical progression\n- Clear methodology'}

Emulate this specific academic writing style while maintaining clarity and accuracy.`;
            } else {
              console.warn('Skipping persona style injection; lastIssue =', lastIssue);
            }
        } catch (error) {
          console.error('Error fetching persona style (robust path):', error);
        }
      }
    }

    const fullPrompt = `${systemPrompt}\n\nUser prompt: ${prompt}`;
    console.log('Generating content with prompt length:', fullPrompt.length);

    console.log('Generating content...');
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    console.log('Generated text length:', text?.length);

    if (!text) {
      console.log('No text generated');
      return NextResponse.json(
        { error: 'No response generated from AI' },
        { status: 500 }
      );
    }

    // Save the generated content to database
    await prisma.generatedContent.create({
      data: {
        prompt,
        generatedText: text,
        language: language || 'English',
        usedWritingStyle: useWritingStyle || false,
      },
    });

    console.log('Returning successful response');
    return NextResponse.json({ response: text });
  } catch (error: unknown) {
    console.error('Error generating text:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const err = error as { message?: string; status?: number };
    
    if (err.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json(
        { error: 'Invalid Google API key. Please check your configuration.' },
        { status: 401 }
      );
    }
    
    if (err.message?.includes('QUOTA_EXCEEDED')) {
      return NextResponse.json(
        { error: 'Google API quota exceeded. Please check your Google Cloud account.' },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate text: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
