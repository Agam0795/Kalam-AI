import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Test different model names to see which ones work
    const modelsToTest = [
      'gemini-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
      'gemini-1.5-flash-latest',
      'models/gemini-pro',
      'models/gemini-1.5-flash'
    ];

    const results = [];

    for (const modelName of modelsToTest) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        const text = response.text();
        
        results.push({
          model: modelName,
          status: 'success',
          response: text.substring(0, 100) + (text.length > 100 ? '...' : '')
        });
        
        // If we found one that works, break
        break;
      } catch (error: any) {
        results.push({
          model: modelName,
          status: 'error',
          error: error.message.substring(0, 200) + (error.message.length > 200 ? '...' : '')
        });
      }
    }

    return NextResponse.json({
      message: 'Model testing complete',
      results
    });

  } catch (error: any) {
    console.error('Error testing models:', error);
    return NextResponse.json({
      error: 'Failed to test models',
      details: error.message
    }, { status: 500 });
  }
}