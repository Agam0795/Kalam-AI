# 🗄️ Style Personas Storage Format & Structure

## 📍 **Storage Location**
- **File**: `src/models/StylePersona.ts`
- **Database**: MongoDB (via Mongoose ODM)
- **Collection**: `stylePersonas`

## 🏗️ **Data Structure Overview**

### **Main Schema Fields**
```typescript
{
  _id: ObjectId,              // MongoDB auto-generated ID
  name: string,               // "Academic Writing Style" 
  status: enum,               // "processing" | "ready" | "error"
  sourceCount: number,        // Number of source papers used
  sourcePapers: Array,        // Academic papers data
  styleProfile: Object,       // Legacy style analysis
  linguisticFingerprint: Object, // Advanced 5D analysis
  originalTexts: Array,       // Raw text samples
  paperAnalyses: Array,       // AI analysis results
  errorMessage?: string,      // Error details if failed
  userId?: string,           // Future user authentication
  isPublic: boolean,         // Share with other users
  createdAt: Date,           // Auto-generated timestamp
  updatedAt: Date            // Auto-generated timestamp
}
```

## 📋 **Detailed Data Format**

### **1. Basic Persona Info**
```json
{
  "name": "Dr. Jane Smith Academic Style",
  "status": "ready",
  "sourceCount": 5,
  "createdAt": "2025-08-10T10:30:00.000Z",
  "updatedAt": "2025-08-10T11:45:00.000Z",
  "isPublic": false
}
```

### **2. Source Papers Array**
```json
{
  "sourcePapers": [
    {
      "id": "arxiv-2024-001",
      "title": "Machine Learning in Healthcare Applications",
      "authors": ["Dr. Jane Smith", "Dr. John Doe"],
      "year": 2024,
      "abstract": "This paper explores the application of ML...",
      "url": "https://arxiv.org/abs/2024.001",
      "pdfUrl": "https://arxiv.org/pdf/2024.001.pdf",
      "isOpenAccess": true
    }
  ]
}
```

### **3. Legacy Style Profile**
```json
{
  "styleProfile": {
    "tone": "formal-academic",
    "keywords": ["methodology", "analysis", "significant", "empirical"],
    "sentenceStyle": "complex-structured",
    "complexity": "complex",
    "formalityLevel": "academic",
    "writingPatterns": ["passive voice frequent", "methodical approach"],
    "vocabularyLevel": "advanced-technical",
    "structuralPreferences": ["introduction-methodology-results"]
  }
}
```

### **4. Advanced Linguistic Fingerprint (5-Dimensional Analysis)**
```json
{
  "linguisticFingerprint": {
    // 📚 LEXICAL ANALYSIS
    "vocabularyRichness": "academic",
    "domainJargon": ["methodology", "empirical", "statistical significance"],
    "favoriteWords": ["furthermore", "consequently", "substantial"],
    "dictionLevel": "abstract",
    "formalityLevel": "formal",
    "contractionsUsage": false,

    // 📝 SYNTACTIC ANALYSIS
    "avgSentenceLength": 24.5,
    "sentenceVariety": "highly-varied",
    "complexityDistribution": {
      "simple": 15,      // 15% simple sentences
      "compound": 25,    // 25% compound sentences
      "complex": 45,     // 45% complex sentences
      "compoundComplex": 15 // 15% compound-complex
    },
    "clauseUsage": ["subordinate clauses", "relative clauses"],
    "sentenceOpeners": ["However", "Furthermore", "In contrast"],

    // 🎯 RHETORICAL ANALYSIS
    "tone": "authoritative-analytical",
    "mood": "objective-scholarly",
    "logicalFlow": "deductive",
    "transitionStyle": ["formal transitions", "logical connectors"],
    "rhetoricalDevices": ["evidence-based arguments", "citations"],
    "informationPacing": "deliberate",

    // 🔍 IDIOSYNCRATIC ANALYSIS
    "punctuationHabits": ["em-dash usage", "semicolon preference"],
    "formattingPreferences": ["numbered lists", "section headers"],
    "fillerPhrases": ["it should be noted", "it is important to"],
    "writingTics": ["frequent parenthetical remarks"],

    // ⚠️ ANOMALY ANALYSIS
    "commonErrors": ["comma splices occasionally"],
    "awkwardPhrasing": ["unnecessarily complex constructions"],
    "consistentMistakes": ["overuse of passive voice"],

    // Legacy compatibility
    "lexicalDiversity": 0.85,
    "sentenceComplexity": "complex",
    "vocabularyLevel": "advanced",
    "readabilityScore": 12.5
  }
}
```

### **5. Original Texts & Analysis**
```json
{
  "originalTexts": [
    "The methodology employed in this study facilitates...",
    "Our findings demonstrate significant correlation...",
    "Furthermore, the statistical analysis reveals..."
  ],
  "paperAnalyses": [
    {
      "paperId": "arxiv-2024-001",
      "analysis": "This paper exhibits formal academic tone with complex sentence structures..."
    }
  ]
}
```

## 💾 **Storage Implementation**

### **Database Connection**
```typescript
// File: src/lib/mongodb.ts
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI);
```

### **Model Usage**
```typescript
// File: src/app/api/personas/route.ts
import StylePersona from '@/models/StylePersona';

// Create new persona
const newPersona = new StylePersona({
  name: "Academic Style",
  sourceCount: 3,
  sourcePapers: [...],
  status: "processing"
});
await newPersona.save();

// Fetch personas
const personas = await StylePersona.find({}).sort({ createdAt: -1 });
```

## 🔄 **Data Flow Process**

```mermaid
User Input → Paper Selection → AI Analysis → Linguistic Processing → Database Storage
```

### **Creation Process:**
1. **User selects papers** → `sourcePapers` array populated
2. **AI analyzes content** → `paperAnalyses` generated
3. **Style extracted** → `linguisticFingerprint` created
4. **Status updated** → "processing" → "ready"
5. **Stored in MongoDB** → Available for text generation

### **Usage Process:**
1. **Fetch persona** → Query by ID or name
2. **Apply style** → Use `linguisticFingerprint` data
3. **Generate text** → With persona characteristics
4. **Track usage** → Update access patterns

## 📊 **Indexes for Performance**
```typescript
StylePersonaSchema.index({ name: 1 });        // Search by name
StylePersonaSchema.index({ status: 1 });      // Filter by status
StylePersonaSchema.index({ createdAt: -1 });  // Sort by creation date
StylePersonaSchema.index({ userId: 1 });      // User-specific queries
```

## 🔒 **Data Validation & Security**
- **Required fields** enforced by schema
- **Enum values** for status and complexity
- **Length limits** on text fields
- **Input sanitization** before storage
- **User isolation** via userId field

This comprehensive storage system allows your Kalam AI to capture, store, and utilize complex writing style characteristics for accurate persona-based text generation.
