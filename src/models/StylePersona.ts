import mongoose, { Schema, Document } from 'mongoose';
import { LinguisticFingerprint } from '@/lib/advancedStyleAnalyzer';

// Style Profile sub-schema (legacy)
const StyleProfileSchema = new Schema(
  {
    // Core Categories (High-level buckets)
    tone: { type: Schema.Types.Mixed, required: true }, 
    sentenceStyle: { type: Schema.Types.Mixed, required: true }, 
    complexity: { type: Schema.Types.Mixed, required: true }, 
    formalityLevel: { type: Schema.Types.Mixed, required: true }, 
    vocabularyLevel: { type: Schema.Types.Mixed }, 
    keywords: { type: Schema.Types.Mixed }, 
    writingPatterns: { type: Schema.Types.Mixed }, 
    structuralPreferences: { type: Schema.Types.Mixed }, 
    cognitiveMarkers: { type: Schema.Types.Mixed }, 
    humanUniqueness: { type: Schema.Types.Mixed }, 
    narrativeTendency: { type: Schema.Types.Mixed }, 
    adaptability: { type: Schema.Types.Mixed }, 
    stylisticDevices: { type: Schema.Types.Mixed }, 
    metaPatterns: { type: Schema.Types.Mixed },

    toneExtended: {
      overall: String,
      emotionalIntensity: String,
      sentimentPolarity: String,
      sarcasm: Boolean,
      humor: String,
      irony: String,
      optimism: String,
      confidenceLevel: String,
      respectfulness: String,
      politeness: String,
      urgency: String,
      persuasiveness: String,
      authorialVoice: String,
    },

    sentenceStyleExtended: {
      averageLength: String,
      variation: String,
      syntaxComplexity: String,
      fragmentUsage: Boolean,
      runOnSentences: Boolean,
      parallelism: Boolean,
      inversions: Boolean,
      ellipticalConstructions: Boolean,
      passiveVoiceFrequency: String,
      activeVoiceFrequency: String,
      punctuationDensity: String,
      exclamatorySentences: String,
      interrogativeSentences: String,
      imperativeSentences: String,
      dashUsage: String,
      ellipsisUsage: String,
      quotationUsage: String,
      fluency: String,
    },

    complexityExtended: {
      readabilityLevel: String,
      gradeLevel: Number,
      logicalDensity: String,
      abstractionLevel: String,
      reasoningType: String,
      ambiguityTolerance: String,
      redundancyLevel: String,
      precision: String,
      clarity: String,
      depthOfExplanation: String,
      flowConsistency: String,
    },

    vocabularyExtended: {
      wordVariety: String,
      rareWordUsage: String,
      domainSpecificTerms: [String],
      adjectiveDensity: String,
      adverbDensity: String,
      nounToVerbRatio: String,
      connotation: String,
      archaicWords: Boolean,
      borrowedWords: [String],
      neologisms: Boolean,
      wordPlay: String,
      onomatopoeia: String,
    },

    stylisticDevicesExtended: {
      alliteration: Boolean,
      assonance: Boolean,
      consonance: Boolean,
      parallelism: Boolean,
      refrains: Boolean,
      oxymoron: Boolean,
      paradox: Boolean,
      allegory: Boolean,
      personification: Boolean,
      imagery: String,
      symbolism: String,
      irony: String,
    },

    metaPatternsExtended: {
      persuasionStyle: String,
      argumentStrength: String,
      evidenceType: String,
      clarityOfClaims: String,
      bias: String,
      rhetoricalAppeals: [String],
      intendedAudience: [String],
    }
  },
  { _id: false, strict: false } // strict:false allows storing additional arbitrary fields (up to 300+)
);

// Advanced Linguistic Fingerprint sub-schema
const LinguisticFingerprintSchema = new Schema({
  // Lexical Analysis
  vocabularyRichness: { 
    type: String, 
    enum: ['simple', 'moderate', 'complex', 'academic', 'technical'],
    required: true 
  },
  domainJargon: [{ type: String }],
  favoriteWords: [{ type: String }],
  dictionLevel: { 
    type: String, 
    enum: ['concrete', 'abstract', 'mixed'],
    required: true 
  },
  formalityLevel: { 
    type: String, 
    enum: ['informal', 'semi-formal', 'formal', 'academic'],
    required: true 
  },
  contractionsUsage: { type: Boolean, required: true },

  // Syntactic Analysis
  avgSentenceLength: { type: Number, required: true },
  sentenceVariety: { 
    type: String, 
    enum: ['uniform', 'moderate', 'highly-varied'],
    required: true 
  },
  complexityDistribution: {
    simple: { type: Number, required: true },
    compound: { type: Number, required: true },
    complex: { type: Number, required: true },
    compoundComplex: { type: Number, required: true }
  },
  clauseUsage: [{ type: String }],
  sentenceOpeners: [{ type: String }],

  // Rhetorical Analysis
  tone: { type: String, required: true },
  mood: { type: String, required: true },
  logicalFlow: { 
    type: String, 
    enum: ['deductive', 'inductive', 'mixed'],
    required: true 
  },
  transitionStyle: [{ type: String }],
  rhetoricalDevices: [{ type: String }],
  informationPacing: { 
    type: String, 
    enum: ['dense', 'moderate', 'deliberate'],
    required: true 
  },

  // Idiosyncratic Analysis
  punctuationHabits: [{ type: String }],
  formattingPreferences: [{ type: String }],
  fillerPhrases: [{ type: String }],
  writingTics: [{ type: String }],

  // Anomaly Analysis
  commonErrors: [{ type: String }],
  awkwardPhrasing: [{ type: String }],
  consistentMistakes: [{ type: String }],

  // Legacy compatibility fields
  lexicalDiversity: { type: Number, required: true },
  sentenceComplexity: { 
    type: String, 
    enum: ['simple', 'moderate', 'complex'],
    required: true 
  },
  vocabularyLevel: { type: String, required: true },
  writingPatterns: [{ type: String }],
  structuralPreferences: [{ type: String }],
  keywords: [{ type: String }],
  readabilityScore: { type: Number, required: true }
}, { _id: false });

// Source Paper sub-schema
const SourcePaperSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  authors: [{ type: String }],
  year: { type: Number },
  abstract: { type: String },
  url: { type: String },
  pdfUrl: { type: String },
  isOpenAccess: { type: Boolean, default: false }
}, { _id: false });

// Paper Analysis sub-schema
const PaperAnalysisSchema = new Schema({
  paperId: { type: String, required: true },
  analysis: { type: String, required: true }
}, { _id: false });

// Main StylePersona schema
const StylePersonaSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  status: { 
    type: String, 
    enum: ['processing', 'ready', 'error'], 
    default: 'processing'
  },
  sourceCount: { 
    type: Number, 
    required: true,
    min: 1
  },
  sourcePapers: [SourcePaperSchema],
  styleProfile: StyleProfileSchema, // Legacy style profile
  linguisticFingerprint: LinguisticFingerprintSchema, // Advanced linguistic analysis
  originalTexts: [{ type: String }], // Store original text excerpts for analysis
  paperAnalyses: [PaperAnalysisSchema],
  errorMessage: { type: String },
  userId: { type: String }, // For future user authentication
  isPublic: { type: Boolean, default: false }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { 
    transform: function(doc: mongoose.Document, ret: Record<string, unknown>) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for better performance
StylePersonaSchema.index({ name: 1 });
StylePersonaSchema.index({ status: 1 });
StylePersonaSchema.index({ createdAt: -1 });
StylePersonaSchema.index({ userId: 1 });

// Interface for TypeScript
export interface IStylePersona extends Document {
  name: string;
  status: 'processing' | 'ready' | 'error';
  sourceCount: number;
  sourcePapers: Array<{
    id: string;
    title: string;
    authors: string[];
    year?: number;
    abstract?: string;
    url?: string;
    pdfUrl?: string;
    isOpenAccess?: boolean;
  }>;
  styleProfile?: {
    // Legacy simple forms
    tone?: string | { default?: string; range?: string[]; markers?: string[] };
    sentenceStyle?: string | { lengthVariation?: string; structure?: string; flow?: string; imperfections?: string };
    complexity?: (
      'simple' | 'moderate' | 'complex' | 'advanced' | 'abstract'
    ) | { thinkingPattern?: string; ideaDelivery?: string; cognitiveMarkers?: string[] };
    formalityLevel?: (
      'casual' | 'professional' | 'academic' | 'informal' | 'semi-formal' | 'formal'
    ) | { spectrum?: string[]; markers?: string[] };
    vocabularyLevel?: string | { base?: string; enrichment?: string; emotionalWords?: string; slang?: string };
    keywords?: string[] | {
      connectiveWords?: string[]; hedging?: string[]; selfReference?: string[]; emphasis?: string[];
    };
    writingPatterns?: string[] | {
      thoughtExpansion?: string; exampleDriven?: string; emphasisRepetition?: string; rhetoricalQuestions?: string; digressions?: string;
    };
    structuralPreferences?: string[] | {
      paragraphs?: { size?: string; shape?: string };
      flow?: { default?: string; variation?: string };
      narrativeTendency?: string;
      argumentStyle?: { logic?: string; emotion?: string };
    };
    cognitiveMarkers?: string[] | {
      streamOfConsciousness?: string; uncertainty?: string; biases?: string; adaptability?: string;
    };
    humanUniqueness?: {
      imperfections?: string[] | string; creativity?: string[] | string; emotion?: string[] | string;
    };
    narrativeTendency?: 'low' | 'medium' | 'high' | {
      useOfStories?: string; personalAnecdotes?: boolean; chronologicalFlow?: boolean; flashbacks?: boolean; foreshadowing?: boolean; dialogueInsertion?: boolean;
    };
    adaptability?: 'low' | 'medium' | 'high' | {
      audienceSensitivity?: string; contextShift?: string; toneShifting?: string; registerFlexibility?: string;
    };
    stylisticDevices?: {
      alliteration?: boolean; assonance?: boolean; consonance?: boolean; parallelism?: boolean; refrains?: boolean; oxymoron?: boolean; paradox?: boolean; allegory?: boolean; personification?: boolean; imagery?: string; symbolism?: string; irony?: string;
    };
    metaPatterns?: {
      persuasionStyle?: string; argumentStrength?: string; evidenceType?: string; clarityOfClaims?: string; bias?: string; rhetoricalAppeals?: string[]; intendedAudience?: string[];
    };
  };
  linguisticFingerprint?: LinguisticFingerprint; // Advanced linguistic analysis
  originalTexts?: string[]; // Store original text excerpts
  paperAnalyses?: Array<{
    paperId: string;
    analysis: string;
  }>;
  errorMessage?: string;
  userId?: string;
  isPublic?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Export the model
const StylePersona = mongoose.models.StylePersona || mongoose.model<IStylePersona>('StylePersona', StylePersonaSchema);

export default StylePersona;
