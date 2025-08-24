import { NextResponse } from 'next/server';

// Fallback personas API endpoint that returns empty data
export async function GET() {
  try {
    // Return empty personas array as fallback
    return NextResponse.json({ 
      personas: [],
      message: 'No personas available - using fallback data',
      fallback: true
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Fallback personas endpoint failed' },
      { status: 500 }
    );
  }
}
