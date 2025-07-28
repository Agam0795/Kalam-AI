// Simple test of the generate API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    console.log('API route called');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { prompt, language, useWritingStyle } = body;

    if (!prompt) {
      console.log('No prompt provided');
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    console.log('API key exists:', !!apiKey);
    console.log('API key starts with:', apiKey?.substring(0, 10));

    if (!apiKey) {
      console.log('No API key found');
      return NextResponse.json(
        { error: 'Google API key not configured. Please add GOOGLE_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    console.log('Initializing Google AI...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = 'You are a helpful AI assistant. Generate a short response.';
    const fullPrompt = `${systemPrompt}\n\nUser prompt: ${prompt}`;

    console.log('Generating content...');
    const result = await model.generateContent(fullPrompt);
    console.log('Got result');
    
    const response = result.response;
    const text = response.text();
    console.log('Got text:', text?.substring(0, 50));

    if (!text) {
      console.log('No text in response');
      return NextResponse.json(
        { error: 'No response generated from AI' },
        { status: 500 }
      );
    }

    console.log('Success!');
    return NextResponse.json({ response: text });
    
  } catch (error) {
    console.error('Error in API route:', error);
    
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
