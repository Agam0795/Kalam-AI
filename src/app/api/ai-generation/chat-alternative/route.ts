import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface AlternativeAPIRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      conversationHistory = [], 
      systemPrompt = 'You are a helpful AI assistant.',
      temperature = 0.7,
      maxTokens = 1000,
      model = 'meta-llama/llama-3.1-8b-instruct:free'
    }: AlternativeAPIRequest = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ALTERNATIVE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Alternative API key not configured' },
        { status: 500 }
      );
    }

    // Build messages array for the API
    const messages = [];
    
    // Add system message
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Add conversation history
    conversationHistory.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Make request to OpenRouter/Alternative API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'Kalam AI Chatbot'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from API');
    }

    const aiResponse = data.choices[0].message.content;

    // Create response message
    const responseMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse.trim(),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      message: responseMessage,
      conversationId: generateConversationId(),
      usage: data.usage || {
        totalTokens: data.usage?.total_tokens || 0,
        model: model
      },
      provider: 'openrouter'
    });

  } catch (error) {
    console.error('Alternative Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate response with alternative API',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Generate a simple conversation ID
function generateConversationId(): string {
  return `alt_conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    status: 'Alternative Chat API is running',
    provider: 'OpenRouter',
    supportedModels: [
      'meta-llama/llama-3.1-8b-instruct:free',
      'google/gemma-2-9b-it:free',
      'microsoft/phi-3-mini-128k-instruct:free'
    ],
    features: [
      'Multiple model support',
      'Conversation history',
      'System prompts',
      'Configurable parameters'
    ],
    timestamp: new Date().toISOString()
  });
}
