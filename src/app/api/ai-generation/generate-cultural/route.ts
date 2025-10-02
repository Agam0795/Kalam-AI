import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface CulturalContext {
  region: string;
  language: string;
  culturalStyle: string;
  targetAudience: string;
  localReferences: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, culturalContext, useHinglish } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash-001" });

    // Build cultural context system prompt
    const systemPrompt = buildCulturalSystemPrompt(culturalContext, useHinglish);

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      response: text,
      culturalContext: culturalContext,
      hinglishUsed: useHinglish
    });

  } catch (error: unknown) {
    console.error('Error in cultural generation:', error);
    
    const err = error as { message?: string };
    return NextResponse.json(
      { error: `Failed to generate culturally adapted content: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

function buildCulturalSystemPrompt(context: CulturalContext, useHinglish: boolean): string {
  let prompt = `You are an AI assistant specialized in creating culturally appropriate content. `;

  if (useHinglish) {
    prompt += `Generate content in Hinglish (Hindi + English code-switching) that feels natural to Indian speakers. Use:
- Common Hindi words mixed with English (e.g., "yaar", "bhai", "actually", "bas")
- Natural code-switching patterns
- Indian expressions and idioms
- Bollywood or cricket references when appropriate
- Indian context for examples and scenarios

`;
  }

  if (context) {
    prompt += `Cultural Context:
- Region: ${context.region || 'India'}
- Target Audience: ${context.targetAudience || 'General Indian audience'}
- Cultural Style: ${context.culturalStyle || 'Friendly and relatable'}
- Language Mix: ${context.language || 'Hinglish'}

`;

    if (context.localReferences) {
      prompt += `Include relevant local references such as:
- Indian festivals (Diwali, Holi, Eid, etc.)
- Local food and culture
- Indian celebrities, movies, or cricket
- Regional customs and traditions
- Indian business culture and etiquette

`;
    }
  }

  prompt += `Guidelines:
- Be authentic and avoid stereotypes
- Use culturally appropriate examples
- Match the tone to the target audience
- Include relevant cultural context naturally
- Make content relatable to the specified region/culture

`;

  return prompt;
}
