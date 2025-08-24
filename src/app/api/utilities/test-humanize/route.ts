import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    console.log('Testing Google API connection...');
    
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Simple test generation
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      message: 'Google API connection successful',
      testResponse: text.trim()
    });

  } catch (error) {
    console.error('Google API test failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Google API connection failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required for testing' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(`Humanize this text: ${text}`);
    const response = await result.response;
    const humanizedText = response.text();

    return NextResponse.json({
      success: true,
      originalText: text,
      humanizedText: humanizedText.trim()
    });

  } catch (error) {
    console.error('Test humanization failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Test humanization failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
