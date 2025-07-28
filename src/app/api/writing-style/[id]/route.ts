import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const writingStyle = await prisma.writingStyle.findUnique({
      where: { id },
    });

    if (!writingStyle) {
      return NextResponse.json(
        { error: 'Writing style not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ writingStyle });
  } catch (error) {
    console.error('Error fetching writing style:', error);
    return NextResponse.json(
      { error: 'Failed to fetch writing style' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.writingStyle.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Writing style deleted successfully' });
  } catch (error) {
    console.error('Error deleting writing style:', error);
    return NextResponse.json(
      { error: 'Failed to delete writing style' },
      { status: 500 }
    );
  }
}
