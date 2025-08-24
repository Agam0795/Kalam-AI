import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database/mongodb';
import StylePersona from '@/models/StylePersona';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    console.log('Personas API: Starting GET request');
    
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.error('MongoDB URI not configured');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    console.log('Personas API: Connecting to database...');
    await connectDB();
    console.log('Personas API: Database connected successfully');

    const url = new URL(request.url);
    const personaId = url.searchParams.get('id');

    if (personaId) {
      console.log('Personas API: Fetching specific persona:', personaId);
      // Get specific persona
      const persona = await StylePersona.findById(personaId);
      if (!persona) {
        return NextResponse.json(
          { error: 'Persona not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ persona });
    }

    console.log('Personas API: Fetching all personas...');
    // Get all personas, sorted by creation date (newest first)
    const personas = await StylePersona.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('Personas API: Found', personas.length, 'personas');
    
    // Transform the data to match the expected format
    const transformedPersonas = personas.map(persona => ({
      id: (persona._id as Types.ObjectId).toString(),
      name: persona.name,
      status: persona.status,
      sourceCount: persona.sourceCount || 0,
      sourcePapers: (persona.sourcePapers || []).map((paper: { id: string; title: string; authors: string[]; year?: number }) => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        year: paper.year || new Date().getFullYear()
      })),
      createdAt: persona.createdAt ? persona.createdAt.toISOString() : new Date().toISOString(),
      analysisComplete: persona.status === 'ready',
      styleProfile: persona.styleProfile,
      errorMessage: persona.errorMessage
    }));

    console.log('Personas API: Returning', transformedPersonas.length, 'transformed personas');
    return NextResponse.json({ personas: transformedPersonas });

  } catch (error) {
    console.error('Error fetching personas:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch personas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    const newPersona = new StylePersona(body);
    const savedPersona = await newPersona.save();

    return NextResponse.json({
      message: 'Persona saved successfully',
      persona: {
        id: savedPersona._id.toString(),
        name: savedPersona.name,
        status: savedPersona.status,
        sourceCount: savedPersona.sourceCount,
        sourcePapers: savedPersona.sourcePapers,
        createdAt: savedPersona.createdAt.toISOString(),
        styleProfile: savedPersona.styleProfile,
        errorMessage: savedPersona.errorMessage
      }
    });

  } catch (error) {
    console.error('Error saving persona:', error);
    return NextResponse.json(
      { error: 'Failed to save persona' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const personaId = url.searchParams.get('id');

    if (!personaId) {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      );
    }

    const deletedPersona = await StylePersona.findByIdAndDelete(personaId);
    
    if (!deletedPersona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Persona deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting persona:', error);
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    );
  }
}
