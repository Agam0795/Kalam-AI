import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_API_KEY not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    console.log('Calling Google API to list available models...');
    
    // Try to list models using the Google API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ListModels API error:', response.status, errorText);
      return NextResponse.json({
        error: 'Failed to list models',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }
    
    const data = await response.json();
    console.log('Available models:', data);
    
    // Filter for models that support generateContent
    const generateModels = data.models?.filter((model: any) => 
      model.supportedGenerationMethods?.includes('generateContent')
    ) || [];
    
    return NextResponse.json({
      success: true,
      totalModels: data.models?.length || 0,
      generateContentModels: generateModels.length,
      models: generateModels.map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        supportedMethods: model.supportedGenerationMethods
      }))
    });

  } catch (error: any) {
    console.error('Error listing models:', error);
    return NextResponse.json({
      error: 'Failed to list models',
      details: error.message
    }, { status: 500 });
  }
}