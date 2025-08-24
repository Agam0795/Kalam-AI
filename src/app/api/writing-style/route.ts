import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle multipart form-data (with optional file upload)
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const title = String(form.get('title') || '').trim();
      const language = String(form.get('language') || 'English');
      const category = String(form.get('category') || 'General');
      const typedContent = String(form.get('content') || '').trim();
      const file = form.get('file') as File | null;

      let fileText = '';
      if (file && typeof file.arrayBuffer === 'function') {
        const fileType = (file as any).type as string | undefined;
        const fileName = (file as any).name as string | undefined;
        const isTextLike = (fileType && fileType.startsWith('text/')) || (fileName && /\.(txt|md|markdown|text)$/i.test(fileName));
        if (!isTextLike) {
          return NextResponse.json(
            { error: 'Unsupported file type. Please upload a .txt or .md file.' },
            { status: 400 }
          );
        }
        // Read as text
        fileText = await (file as any).text();
      }

      const contentCombined = [typedContent, fileText].filter(Boolean).join('\n\n').trim();

      if (!title || !contentCombined) {
        return NextResponse.json(
          { error: 'Title and at least some content (file or text) are required' },
          { status: 400 }
        );
      }

      const writingStyle = await prisma.writingStyle.create({
        data: {
          title,
          content: contentCombined,
          language,
          category,
        },
      });

      return NextResponse.json({
        message: 'Writing style saved successfully',
        id: writingStyle.id,
      });
    }

    // Default JSON body support
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
