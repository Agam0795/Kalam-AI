import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      conversationHistory = [], 
      systemPrompt,
      temperature = 0.7,
      maxTokens = 1000
    }: ChatRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
      }
    });

    // Build conversation context
    let conversationContext = '';
    
    // Add system prompt if provided
    if (systemPrompt) {
      conversationContext += `System: ${systemPrompt}\n\n`;
    }

    // Add conversation history
    if (conversationHistory.length > 0) {
      conversationContext += 'Previous conversation:\n';
      conversationHistory.slice(-10).forEach(msg => { // Keep last 10 messages for context
        conversationContext += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
      });
      conversationContext += '\n';
    }

    // Add current message
    conversationContext += `Human: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const aiResponse = response.text();

    // Create response message
    const responseMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse.trim(),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      message: responseMessage,
      conversationId: generateConversationId(),
      usage: {
        totalTokens: conversationContext.length + aiResponse.length,
        model: 'gemini-pro'
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
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
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate a simple conversation ID
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'Chat API is running',
    model: 'gemini-pro',
    features: [
      'Conversation history support',
      'System prompts',
      'Configurable temperature',
      'Token limiting'
    ],
    timestamp: new Date().toISOString()
  });
}
