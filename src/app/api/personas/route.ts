import { NextRequest, NextResponse } from 'next/server';
// Using direct path to avoid module resolution issues with '@/lib/mongodb' shim
import connectDB from '@/lib/database/mongodb';
import StylePersona from '@/models/StylePersona';
import { Types } from 'mongoose';
import { listPersonas, getPersona as getPersonaFile, savePersona as savePersonaFile, deletePersona as deletePersonaFile } from '@/lib/filePersonaStore';

export async function GET(request: NextRequest) {
  try {
    console.log('Personas API: Starting GET request');
    
    const useDb = !!process.env.MONGODB_URI;
    if (useDb) {
      console.log('Personas API: Connecting to database...');
      await connectDB();
      console.log('Personas API: Database connected successfully');
    } else {
      console.log('Personas API: Using file-based persona store fallback');
    }

    const url = new URL(request.url);
    const personaId = url.searchParams.get('id');

    if (personaId) {
      console.log('Personas API: Fetching specific persona:', personaId);
      if (useDb) {
        const persona = await StylePersona.findById(personaId);
        if (!persona) return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
        return NextResponse.json({ persona });
      } else {
        const persona = await getPersonaFile(personaId);
        if (!persona) return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
        return NextResponse.json({ persona });
      }
    }

    console.log('Personas API: Fetching all personas...');
    if (useDb) {
      const personas = await StylePersona.find({})
        .sort({ createdAt: -1 })
        .lean();
      console.log('Personas API: Found', personas.length, 'personas');
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
      return NextResponse.json({ personas: transformedPersonas });
    } else {
      const personas = await listPersonas();
      return NextResponse.json({ personas });
    }

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
    const useDb = !!process.env.MONGODB_URI;
    const raw = await request.json();

    // Normalize incoming payload to ensure required fields
    const now = new Date();
    const body: any = { ...raw };
    if (!body.name) {
      body.name = body.styleProfile?.tone?.overall || body.styleProfile?.tone?.default || 'Untitled Persona';
    }
    if (!body.status) body.status = 'ready';
    if (!body.sourceCount || typeof body.sourceCount !== 'number' || body.sourceCount < 1) {
      const derived = Array.isArray(body.sourcePapers) ? body.sourcePapers.length : 0;
      body.sourceCount = derived > 0 ? derived : 1; // satisfy schema min:1
    }
    // Map single text field into originalTexts array if provided
    if (body.text && !body.originalTexts) {
      body.originalTexts = [String(body.text)];
    }
    if (!Array.isArray(body.originalTexts)) body.originalTexts = body.originalTexts ? [body.originalTexts].flat() : [];
    // Ensure styleProfile existence
    if (!body.styleProfile) body.styleProfile = {};
    // Accept extended nested structures as-is; schema fields are Mixed

    if (useDb) {
      await connectDB();
      const newPersona = new StylePersona(body);
      const savedPersona = await newPersona.save();
      // Also persist to file store for mirroring
      try {
        await savePersonaFile({
          id: savedPersona._id.toString(),
          name: savedPersona.name,
          status: savedPersona.status,
          sourceCount: savedPersona.sourceCount,
          styleProfile: savedPersona.styleProfile,
          sourcePapers: savedPersona.sourcePapers,
          paperAnalyses: savedPersona.paperAnalyses,
          originalTexts: savedPersona.originalTexts,
          errorMessage: savedPersona.errorMessage,
          createdAt: savedPersona.createdAt.toISOString(),
          updatedAt: savedPersona.updatedAt.toISOString(),
          linguisticFingerprint: (savedPersona as any).linguisticFingerprint
        });
      } catch (e) {
        console.error('File mirror save failed:', e);
      }
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
          errorMessage: savedPersona.errorMessage,
          linguisticFingerprint: (savedPersona as any).linguisticFingerprint
        }
      });
    } else {
      const saved = await savePersonaFile({
        name: body.name,
        status: body.status || 'processing',
        sourceCount: body.sourceCount || 0,
        styleProfile: body.styleProfile || {},
        sourcePapers: body.sourcePapers || [],
        originalTexts: body.originalTexts || [],
        paperAnalyses: body.paperAnalyses || [],
        errorMessage: body.errorMessage || null,
        linguisticFingerprint: body.linguisticFingerprint || undefined,
        createdAt: body.createdAt || undefined,
        updatedAt: body.updatedAt || undefined
      });
      return NextResponse.json({ message: 'Persona saved successfully', persona: saved });
    }

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
    const useDb = !!process.env.MONGODB_URI;
    const url = new URL(request.url);
    const personaId = url.searchParams.get('id');
    if (!personaId) return NextResponse.json({ error: 'Persona ID is required' }, { status: 400 });
    if (useDb) {
      await connectDB();
      const deletedPersona = await StylePersona.findByIdAndDelete(personaId);
      if (!deletedPersona) return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
  // Mirror delete in file store
  try { await deletePersonaFile(personaId); } catch (e) { console.warn('File mirror delete failed:', e); }
      return NextResponse.json({ message: 'Persona deleted successfully' });
    } else {
      const ok = await deletePersonaFile(personaId);
      if (!ok) return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
      return NextResponse.json({ message: 'Persona deleted successfully' });
    }

  } catch (error) {
    console.error('Error deleting persona:', error);
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    );
  }
}
