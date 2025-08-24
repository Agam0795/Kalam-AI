import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/database/db';

interface ContentGoal {
  frequency: string; // e.g., "twice a week"
  platform: string; // e.g., "blog", "social media"
  niche: string; // e.g., "AI trends", "tech news"
  targetAudience: string;
  contentType: string; // e.g., "articles", "posts", "newsletters"
}

type ModelType = {
  generateContent: (prompt: string) => Promise<{
    response: {
      text: () => string;
    };
  }>;
};

export async function POST(request: NextRequest) {
  try {
    const { contentGoal, action } = await request.json();

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    switch (action) {
      case 'research_trending':
        return await researchTrendingTopics(model, contentGoal);
      
      case 'suggest_headlines':
        return await suggestHeadlines(model, contentGoal);
      
      case 'create_content_calendar':
        return await createContentCalendar(model, contentGoal);
      
      case 'generate_draft':
        const { selectedTopic } = await request.json();
        return await generateContentDraft(model, contentGoal, selectedTopic);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error: unknown) {
    console.error('Error in content strategy:', error);
    
    const err = error as { message?: string };
    return NextResponse.json(
      { error: `Content strategy error: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

async function researchTrendingTopics(model: ModelType, goal: ContentGoal) {
  const prompt = `You are a content strategy AI. Research and suggest trending topics for ${goal.niche} content.

Content Goal:
- Platform: ${goal.platform}
- Frequency: ${goal.frequency}
- Niche: ${goal.niche}
- Target Audience: ${goal.targetAudience}
- Content Type: ${goal.contentType}

Generate 10 trending topic ideas that are:
1. Currently relevant and timely
2. Aligned with the niche
3. Engaging for the target audience
4. Suitable for the specified platform

For each topic, provide:
- Topic title
- Why it's trending
- Potential angle/approach
- Estimated engagement potential (High/Medium/Low)
- Suggested publishing timeframe

Format as JSON array.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    const topics = JSON.parse(response);
    return NextResponse.json({ topics, action: 'research_trending' });
  } catch {
    return NextResponse.json({ 
      topics: response, 
      action: 'research_trending',
      note: 'Response in text format'
    });
  }
}

async function suggestHeadlines(model: ModelType, goal: ContentGoal) {
  const prompt = `Create compelling headlines for ${goal.niche} content targeting ${goal.targetAudience}.

Generate 15 headline variations across different styles:
- 5 Question-based headlines
- 5 How-to headlines  
- 5 List/Number-based headlines

Each headline should be:
- Attention-grabbing
- SEO-friendly
- Platform-appropriate for ${goal.platform}
- Relevant to ${goal.niche}

Include estimated click-through rate potential for each.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return NextResponse.json({ 
    headlines: response, 
    action: 'suggest_headlines' 
  });
}

async function createContentCalendar(model: ModelType, goal: ContentGoal) {
  const prompt = `Create a 30-day content calendar for ${goal.contentType} publishing ${goal.frequency}.

Content Details:
- Platform: ${goal.platform}
- Niche: ${goal.niche}
- Target Audience: ${goal.targetAudience}

For each content piece, include:
- Publishing date
- Content title/topic
- Content type (article, post, video, etc.)
- Key themes/keywords
- Call-to-action suggestion
- Cross-promotion opportunities

Ensure variety in:
- Content formats
- Topics within the niche
- Engagement styles
- Publishing times (if relevant)

Format as a structured calendar.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Store the calendar in database for future reference
  try {
    await prisma.generatedContent.create({
      data: {
        prompt: 'Content Calendar Generation',
        generatedText: response,
        language: 'English',
        usedWritingStyle: false,
      },
    });
  } catch (dbError) {
    console.log('Calendar storage failed:', dbError);
  }

  return NextResponse.json({ 
    calendar: response, 
    action: 'create_content_calendar' 
  });
}

async function generateContentDraft(model: ModelType, goal: ContentGoal, topic: string) {
  const prompt = `Generate a complete ${goal.contentType} draft for the topic: "${topic}"

Content Requirements:
- Platform: ${goal.platform}
- Target Audience: ${goal.targetAudience}
- Niche: ${goal.niche}

Include:
- Compelling headline
- Introduction hook
- Main content body
- Conclusion with call-to-action
- Relevant hashtags (if for social media)
- SEO keywords naturally integrated

Tone: Professional yet engaging, appropriate for ${goal.targetAudience}
Length: Optimal for ${goal.platform}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Store the draft for review
  try {
    await prisma.generatedContent.create({
      data: {
        prompt: `Content Draft: ${topic}`,
        generatedText: response,
        language: 'English',
        usedWritingStyle: false,
      },
    });
  } catch (dbError) {
    console.log('Draft storage failed:', dbError);
  }

  return NextResponse.json({ 
    draft: response, 
    topic: topic,
    action: 'generate_draft' 
  });
}
