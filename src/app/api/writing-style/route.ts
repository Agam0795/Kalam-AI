import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { title, content, language, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const writingStyle = await prisma.writingStyle.create({
      data: {
        title,
        content,
        language: language || 'English',
        category: category || 'General',
      },
    });

    return NextResponse.json({
      message: 'Writing style saved successfully',
      id: writingStyle.id,
    });
  } catch (error) {
    console.error('Error saving writing style:', error);
    return NextResponse.json(
      { error: 'Failed to save writing style' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const writingStyles = await prisma.writingStyle.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        language: true,
        category: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ writingStyles });
  } catch (error) {
    console.error('Error fetching writing styles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch writing styles' },
      { status: 500 }
    );
  }
}
