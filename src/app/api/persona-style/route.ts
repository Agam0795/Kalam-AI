import { NextRequest, NextResponse } from 'next/server';
// Force Node runtime & dynamic rendering to avoid static HTML fallback that leads to Unexpected token '<'
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Using direct path to avoid module resolution issues with '@/lib/mongodb' shim
import connectDB from '@/lib/database/mongodb';
import StylePersona from '@/models/StylePersona';
// Import directly from analyzers implementation to avoid shim resolution issue
import { linguisticPersonaEmulator, type LinguisticFingerprint } from '@/lib/analyzers/advancedStyleAnalyzer';

// Function to generate humanized persona prompts
function generateHumanizedPersonaPrompt(fingerprint: LinguisticFingerprint, task: string): string {
  const { tone, mood, formalityLevel, contractionsUsage, fillerPhrases, writingTics } = fingerprint;
  
  // Create a more natural, humanized prompt
  let humanizedPrompt = `Hey there! You're writing as someone who `;
  
  // Add personality traits in natural language
  if (tone && mood) {
    humanizedPrompt += `has a ${tone.toLowerCase()} tone with a ${mood.toLowerCase()} mood. `;
  }
  
  // Add formality level naturally
  switch (formalityLevel) {
    case 'informal':
      humanizedPrompt += `They're super casual and relaxed in their writing. `;
      break;
    case 'semi-formal':
      humanizedPrompt += `They strike a nice balance - professional but approachable. `;
      break;
    case 'formal':
      humanizedPrompt += `They're quite professional and polished in their communication. `;
      break;
    case 'academic':
      humanizedPrompt += `They write with scholarly precision and depth. `;
      break;
  }
  
  // Add contractions usage
  if (contractionsUsage) {
    humanizedPrompt += `They love using contractions (don't, won't, it's) - makes everything sound more natural. `;
  } else {
    humanizedPrompt += `They tend to avoid contractions, keeping things more formal. `;
  }
  
  // Add filler phrases if any
  if (fillerPhrases && fillerPhrases.length > 0) {
    humanizedPrompt += `You'll notice they use phrases like "${fillerPhrases.slice(0, 2).join('" and "')}" quite a bit. `;
  }
  
  // Add writing tics if any
  if (writingTics && writingTics.length > 0) {
    const ticsDescription = writingTics.slice(0, 2).join(', ');
    humanizedPrompt += `They have some quirky writing habits: ${ticsDescription}. `;
  }
  
  humanizedPrompt += `\n\nNow, here's what you need to do: ${task}\n\n`;
  humanizedPrompt += `Write it exactly how this person would - don't just copy their style, BE them. Make it feel authentic and natural, like they're actually sitting down and writing this themselves. Ready? Go for it!`;
  
  return humanizedPrompt;
}

export async function GET(request: NextRequest) {
  const started = Date.now();
  let dbConnected = false;
  try {
    await connectDB();
    dbConnected = true;

    const url = new URL(request.url);
    const personaId = url.searchParams.get('id');
    const task = url.searchParams.get('task');
    const health = url.searchParams.get('health');
    const debug = url.searchParams.get('debug');

    if (health === '1') {
      return NextResponse.json({
        ok: true,
        route: '/api/persona-style',
        dbConnected,
        env: {
          googleAuthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
        },
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - started
      });
    }

    if (!personaId) {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      );
    }

    const persona = await StylePersona.findById(personaId)
      .select('styleProfile linguisticFingerprint name status originalTexts')
      .lean() as unknown as {
        _id: any;
        name: string;
        status: string;
        styleProfile: Record<string, unknown>;
        linguisticFingerprint?: LinguisticFingerprint;
        originalTexts?: string[];
      } | null;

  if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    if (persona.status !== 'ready') {
      return NextResponse.json(
        { error: 'Persona is not ready for use' },
        { status: 400 }
      );
    }

    // Define the response type for type safety
    interface PersonaStyleResponse {
      id: string;
      name: string;
      styleProfile: Record<string, unknown>;
      linguisticFingerprint?: LinguisticFingerprint;
      personaPrompt?: string;
      humanizedPrompt?: string;
    }

    // Prepare response with both legacy and advanced fingerprints
    const response: PersonaStyleResponse = {
      id: persona._id.toString(),
      name: persona.name,
      styleProfile: persona.styleProfile // Legacy compatibility
    };

    // If we have a linguistic fingerprint, use it
    if (persona.linguisticFingerprint) {
      response.linguisticFingerprint = persona.linguisticFingerprint;
      
      // Generate persona prompt if task is provided
      if (task) {
        const personaPrompt = linguisticPersonaEmulator.generatePersonaPrompt(
          persona.linguisticFingerprint,
          task
        );
        response.personaPrompt = personaPrompt;
        
        // Generate humanized version of the persona prompt
        response.humanizedPrompt = generateHumanizedPersonaPrompt(
          persona.linguisticFingerprint,
          task
        );
      }
    } else if (persona.originalTexts && persona.originalTexts.length > 0) {
      // Fallback: Generate linguistic fingerprint from original texts if not available
      const combinedText = persona.originalTexts.slice(0, 3).join('\n\n');
      if (combinedText.length > 200) {
        const fingerprint = linguisticPersonaEmulator.createLinguisticFingerprint(combinedText);
        response.linguisticFingerprint = fingerprint;
        
        if (task) {
          const personaPrompt = linguisticPersonaEmulator.generatePersonaPrompt(fingerprint, task);
          response.personaPrompt = personaPrompt;
          
          // Generate humanized version
          response.humanizedPrompt = generateHumanizedPersonaPrompt(fingerprint, task);
        }
      }
    }

    if (debug === '1') {
      (response as any)._debug = {
        dbConnected,
        durationMs: Date.now() - started,
        hasLinguisticFingerprint: !!response.linguisticFingerprint,
        personaIdRequested: personaId
      };
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching persona style:', error);
    return NextResponse.json({
      error: 'Failed to fetch persona style',
      details: error instanceof Error ? error.message : 'Unknown error',
      dbConnected,
      durationMs: Date.now() - started
    }, { status: 500 });
  }
}
