import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Generate API called');
    const { prompt, language, useWritingStyle } = await request.json();
    console.log('Request data:', { prompt: prompt?.substring(0, 50), language, useWritingStyle });

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

    // If user wants to use their writing style, fetch examples from database
    if (useWritingStyle) {
      const writingStyles = await prisma.writingStyle.findMany({
        where: language ? { language } : {},
        orderBy: { createdAt: 'desc' },
        take: 3, // Get the 3 most recent examples
      });

      if (writingStyles.length > 0) {
        const styleExamples = writingStyles
          .map((style: { title: string; content: string }) => `Title: ${style.title}\nContent: ${style.content}`)
          .join('\n\n---\n\n');

        systemPrompt += `\n\nIMPORTANT: Please write in the same style, tone, and manner as shown in these examples from the user's own writing:\n\n${styleExamples}\n\nMimic the writing style, vocabulary choices, sentence structure, and tone from these examples.`;
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
