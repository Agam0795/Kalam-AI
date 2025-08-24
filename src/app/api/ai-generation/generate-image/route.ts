import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { text, imageStyle, contentType } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required for image generation' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Analyze the text to create an appropriate image prompt
    const imagePromptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating image generation prompts. Given a piece of text content, create a detailed, visual prompt for DALL-E that would create an appropriate header image or illustration.

Consider the content type: ${contentType || 'general'}
Desired style: ${imageStyle || 'professional'}

Guidelines:
- For formal/business content: Use professional, clean, modern aesthetics
- For creative content: Use artistic, expressive, imaginative styles
- For technical content: Use diagrams, charts, or tech-focused visuals
- For casual content: Use friendly, approachable, lifestyle imagery

Return only the image prompt, nothing else.`
        },
        {
          role: "user",
          content: `Create an image prompt for this content:\n\n${text.substring(0, 2000)}`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const imagePrompt = imagePromptResponse.choices[0]?.message?.content;

    if (!imagePrompt) {
      return NextResponse.json(
        { error: 'Failed to generate image prompt' },
        { status: 500 }
      );
    }

    // Generate the image using DALL-E
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    const imageUrl = imageResponse.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl,
      imagePrompt,
      style: imageStyle,
      contentType
    });

  } catch (error: unknown) {
    console.error('Error generating image:', error);
    
    const err = error as { message?: string };
    return NextResponse.json(
      { error: `Failed to generate image: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
