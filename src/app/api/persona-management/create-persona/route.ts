import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '@/lib/database/mongodb';
import StylePersona from '@/models/StylePersona';

interface CreatePersonaRequest {
  name: string;
  selectedPapers: Array<{
    id: string;
    title: string;
    authors: string[];
    abstract: string;
    url: string;
    pdfUrl?: string;
    isOpenAccess?: boolean;
  }>;
}

interface StyleProfile {
  tone: string;
  keywords: string[];
  sentenceStyle: string;
  complexity: 'simple' | 'moderate' | 'complex';
  formalityLevel: 'casual' | 'professional' | 'academic';
  writingPatterns: string[];
  vocabularyLevel: string;
  structuralPreferences: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    const body: CreatePersonaRequest = await request.json();
    const { name, selectedPapers } = body;

    if (!name || !selectedPapers || selectedPapers.length === 0) {
      return NextResponse.json(
        { error: 'Name and at least one paper are required' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    // Create initial persona record in database with processing status
    const newPersona = new StylePersona({
      name,
      status: 'processing',
      sourceCount: selectedPapers.length,
      sourcePapers: selectedPapers.map(paper => ({
        id: paper.id,
        title: paper.title,
        authors: paper.authors,
        year: new Date().getFullYear(), // You might want to extract this from paper data
        abstract: paper.abstract,
        url: paper.url,
        pdfUrl: paper.pdfUrl,
        isOpenAccess: paper.isOpenAccess
      }))
    });

    const savedPersona = await newPersona.save();

    // Start background processing (in a real app, you'd use a queue system)
    processPersonaAnalysis(savedPersona._id.toString(), selectedPapers);

    return NextResponse.json({
      message: 'Style persona creation started',
      persona: {
        id: savedPersona._id.toString(),
        name: savedPersona.name,
        status: savedPersona.status,
        sourceCount: savedPersona.sourceCount,
        sourcePapers: savedPersona.sourcePapers,
        createdAt: savedPersona.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating style persona:', error);
    return NextResponse.json(
      { error: 'Failed to create style persona' },
      { status: 500 }
    );
  }
}

// Background processing function
async function processPersonaAnalysis(personaId: string, selectedPapers: CreatePersonaRequest['selectedPapers']) {
  try {
    await connectDB();

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash-001' });

    // Analyze each paper's abstract and extract writing patterns
    const paperAnalyses = await Promise.all(
      selectedPapers.map(async (paper) => {
        const analysisPrompt = `
Analyze the writing style of this academic paper abstract. Focus on:

1. Tone and formality level
2. Sentence structure and complexity
3. Vocabulary sophistication
4. Technical terminology usage
5. Argumentation patterns
6. Overall writing characteristics

Paper Title: ${paper.title}
Authors: ${paper.authors.join(', ')}
Abstract: ${paper.abstract}

Provide a detailed analysis of the writing style characteristics that could be used to emulate this author's style.
`;

        try {
          const result = await model.generateContent(analysisPrompt);
          const response = await result.response;
          return {
            paperId: paper.id,
            title: paper.title,
            analysis: response.text()
          };
        } catch (error) {
          console.error(`Error analyzing paper ${paper.id}:`, error);
          return {
            paperId: paper.id,
            title: paper.title,
            analysis: 'Analysis failed for this paper'
          };
        }
      })
    );

    // Synthesize the individual analyses into a unified style profile
    const synthesisPrompt = `
Based on the following individual paper analyses, create a unified writing style profile that captures the common patterns and characteristics. 

${paperAnalyses.map(analysis => `
Paper: ${analysis.title}
Analysis: ${analysis.analysis}
`).join('\\n\\n')}

Create a comprehensive style profile in JSON format with the following structure:
{
  "tone": "Description of overall tone (e.g., 'Formal, Academic, Objective')",
  "keywords": ["array", "of", "key", "technical", "terms", "frequently", "used"],
  "sentenceStyle": "Description of sentence patterns (e.g., 'Complex, High Variance')",
  "complexity": "simple|moderate|complex",
  "formalityLevel": "casual|professional|academic",
  "writingPatterns": ["Common", "writing", "patterns", "observed"],
  "vocabularyLevel": "Description of vocabulary sophistication",
  "structuralPreferences": ["Preferred", "structural", "elements"]
}

Focus on patterns that appear consistently across multiple papers. Be specific and actionable - this profile will be used to guide AI text generation.
`;

    const synthesisResult = await model.generateContent(synthesisPrompt);
    const synthesisResponse = await synthesisResult.response;
    let styleProfile: StyleProfile;

    try {
      // Extract JSON from the response
      const responseText = synthesisResponse.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        styleProfile = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing style profile:', parseError);
      // Fallback profile
      styleProfile = {
        tone: 'Academic, Professional',
        keywords: selectedPapers.flatMap(p => p.title.split(' ')).slice(0, 10),
        sentenceStyle: 'Complex, Structured',
        complexity: 'complex',
        formalityLevel: 'academic',
        writingPatterns: ['Technical precision', 'Methodical approach'],
        vocabularyLevel: 'Advanced academic vocabulary',
        structuralPreferences: ['Logical progression', 'Evidence-based arguments']
      };
    }

    // Update the persona with analysis results
    await StylePersona.findByIdAndUpdate(personaId, {
      status: 'ready',
      styleProfile,
      paperAnalyses: paperAnalyses.map(a => ({ paperId: a.paperId, analysis: a.analysis }))
    });

  } catch (error) {
    console.error('Error processing persona analysis:', error);
    
    // Update persona with error status
    await StylePersona.findByIdAndUpdate(personaId, {
      status: 'error',
      errorMessage: 'Failed to analyze papers. Please try again with different selections.'
    });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Style Persona Creation API',
    usage: 'POST with { "name": "Persona Name", "selectedPapers": [...] }',
    features: [
      'AI-powered writing style analysis',
      'Multi-paper synthesis',
      'Comprehensive style profiling',
      'Academic writing pattern extraction'
    ]
  });
}
