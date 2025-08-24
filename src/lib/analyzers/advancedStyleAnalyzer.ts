// Advanced Linguistic Persona Emulator for Kalam AI
// 5-dimensional style analysis with deep linguistic fingerprinting

export interface LinguisticFingerprint {
  // Lexical Analysis (Vocabulary)
  vocabularyRichness: 'simple' | 'moderate' | 'complex' | 'academic' | 'technical';
  domainJargon: string[];
  favoriteWords: string[];
  dictionLevel: 'concrete' | 'abstract' | 'mixed';
  formalityLevel: 'informal' | 'semi-formal' | 'formal' | 'academic';
  contractionsUsage: boolean;

  // Syntactic Analysis (Sentence Structure)
  avgSentenceLength: number;
  sentenceVariety: 'uniform' | 'moderate' | 'highly-varied';
  complexityDistribution: {
    simple: number;
    compound: number;
    complex: number;
    compoundComplex: number;
  };
  clauseUsage: string[];
  sentenceOpeners: string[];

  // Rhetorical Analysis (Argument & Thought)
  tone: string;
  mood: string;
  logicalFlow: 'deductive' | 'inductive' | 'mixed';
  transitionStyle: string[];
  rhetoricalDevices: string[];
  informationPacing: 'dense' | 'moderate' | 'deliberate';

  // Idiosyncratic Analysis (Quirks & Patterns)
  punctuationHabits: string[];
  formattingPreferences: string[];
  fillerPhrases: string[];
  writingTics: string[];

  // Anomaly Analysis (Mistakes & Imperfections)
  commonErrors: string[];
  awkwardPhrasing: string[];
  consistentMistakes: string[];

  // Legacy compatibility
  lexicalDiversity: number;
  sentenceComplexity: 'simple' | 'moderate' | 'complex';
  vocabularyLevel: string;
  writingPatterns: string[];
  structuralPreferences: string[];
  keywords: string[];
  readabilityScore: number;
}

export interface AdvancedTextMetrics {
  totalWords: number;
  uniqueWords: number;
  avgWordsPerSentence: number;
  sentences: string[];
  paragraphs: string[];
  complexSentences: number;
  academicTerms: number;
  passiveVoiceCount: number;
  punctuationFrequency: { [key: string]: number };
  clausePatterns: string[];
  contractionsCount: number;
  sentenceLengthVariation: number;
}

export class LinguisticPersonaEmulator {
  private academicKeywords = [
    'therefore', 'however', 'moreover', 'furthermore', 'consequently',
    'nevertheless', 'empirical', 'hypothesis', 'methodology', 'analysis',
    'framework', 'paradigm', 'theoretical', 'substantial', 'significant',
    'demonstrate', 'establish', 'investigate', 'examine', 'evaluate',
    'elucidate', 'substantiate', 'corroborate', 'postulate', 'extrapolate'
  ];

  private formalWords = [
    'utilize', 'demonstrate', 'facilitate', 'implement', 'establish',
    'enhance', 'optimize', 'constitute', 'encompass', 'exemplify',
    'ascertain', 'endeavor', 'procurement', 'methodology', 'subsequent'
  ];

  private casualWords = [
    'use', 'show', 'help', 'do', 'make', 'improve', 'better', 'include',
    'like', 'get', 'want', 'need', 'think', 'know', 'see', 'pretty',
    'really', 'kind of', 'sort of', 'stuff', 'things', 'guy', 'gonna'
  ];

  private transitionWords = [
    'however', 'therefore', 'consequently', 'nevertheless', 'furthermore',
    'moreover', 'in addition', 'on the other hand', 'in contrast',
    'similarly', 'likewise', 'for instance', 'for example', 'in conclusion'
  ];

  private commonFillers = [
    'in essence', 'it should be noted', 'for all intents and purposes',
    'at the end of the day', 'needless to say', 'to be honest',
    'basically', 'literally', 'actually', 'obviously', 'clearly'
  ];

  private contractions = [
    "don't", "can't", "won't", "isn't", "aren't", "wasn't", "weren't",
    "haven't", "hasn't", "hadn't", "shouldn't", "couldn't", "wouldn't",
    "it's", "that's", "there's", "here's", "what's", "who's", "where's"
  ];

  public createLinguisticFingerprint(text: string): LinguisticFingerprint {
    const metrics = this.calculateAdvancedMetrics(text);
    
    return {
      // Lexical Analysis
      vocabularyRichness: this.analyzeVocabularyRichness(text, metrics),
      domainJargon: this.extractDomainJargon(text),
      favoriteWords: this.identifyFavoriteWords(text),
      dictionLevel: this.analyzeDictionLevel(text),
      formalityLevel: this.analyzeFormalityLevel(text),
      contractionsUsage: this.detectContractions(text),

      // Syntactic Analysis
      avgSentenceLength: metrics.avgWordsPerSentence,
      sentenceVariety: this.analyzeSentenceVariety(metrics),
      complexityDistribution: this.analyzeSentenceComplexity(metrics.sentences),
      clauseUsage: this.analyzeClauseUsage(text),
      sentenceOpeners: this.analyzeSentenceOpeners(metrics.sentences),

      // Rhetorical Analysis
      tone: this.analyzeTone(text),
      mood: this.analyzeMood(text),
      logicalFlow: this.analyzeLogicalFlow(text),
      transitionStyle: this.analyzeTransitions(text),
      rhetoricalDevices: this.identifyRhetoricalDevices(text),
      informationPacing: this.analyzeInformationPacing(text, metrics),

      // Idiosyncratic Analysis
      punctuationHabits: this.analyzePunctuationHabits(metrics.punctuationFrequency),
      formattingPreferences: this.analyzeFormattingPreferences(text),
      fillerPhrases: this.identifyFillerPhrases(text),
      writingTics: this.identifyWritingTics(text),

      // Anomaly Analysis
      commonErrors: this.identifyCommonErrors(text),
      awkwardPhrasing: this.identifyAwkwardPhrasing(metrics.sentences),
      consistentMistakes: this.identifyConsistentMistakes(text),

      // Legacy compatibility
      lexicalDiversity: metrics.uniqueWords / metrics.totalWords,
      sentenceComplexity: this.determineSentenceComplexity(metrics.avgWordsPerSentence),
      vocabularyLevel: this.determineVocabularyLevel(text),
      writingPatterns: this.analyzeWritingPatterns(text, metrics),
      structuralPreferences: this.analyzeStructure(text),
      keywords: this.extractKeywords(text),
      readabilityScore: this.calculateReadabilityScore(metrics)
    };
  }

  private calculateAdvancedMetrics(text: string): AdvancedTextMetrics {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 0);
    const uniqueWords = [...new Set(words)];
    
    // Calculate punctuation frequency
    const punctuationFrequency: { [key: string]: number } = {};
    const punctuationMarks = text.match(/[.,;:!?()"\-—]/g) || [];
    punctuationMarks.forEach(mark => {
      punctuationFrequency[mark] = (punctuationFrequency[mark] || 0) + 1;
    });

    // Count contractions
    const contractionsCount = this.contractions.reduce((count, contraction) => 
      count + (text.toLowerCase().split(contraction.toLowerCase()).length - 1), 0);

    // Calculate sentence length variation
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, length) => sum + Math.pow(length - avgLength, 2), 0) / sentenceLengths.length;
    const sentenceLengthVariation = Math.sqrt(variance);

    return {
      totalWords: words.length,
      uniqueWords: uniqueWords.length,
      avgWordsPerSentence: words.length / sentences.length,
      sentences,
      paragraphs,
      complexSentences: sentences.filter(s => s.split(',').length > 2).length,
      academicTerms: this.academicKeywords.reduce((count, term) => 
        count + (text.toLowerCase().split(term.toLowerCase()).length - 1), 0),
      passiveVoiceCount: (text.match(/\b(was|were|is|are|been|being)\s+\w+ed\b/gi) || []).length,
      punctuationFrequency,
      clausePatterns: this.extractClausePatterns(text),
      contractionsCount,
      sentenceLengthVariation
    };
  }

  // LEXICAL ANALYSIS METHODS
  private analyzeVocabularyRichness(text: string, metrics: AdvancedTextMetrics): 'simple' | 'moderate' | 'complex' | 'academic' | 'technical' {
    const lexicalDiversity = metrics.uniqueWords / metrics.totalWords;
    const academicRatio = metrics.academicTerms / metrics.totalWords;
    const avgWordLength = text.split(/\W+/).reduce((sum, word) => sum + word.length, 0) / metrics.totalWords;

    if (academicRatio > 0.05) return 'academic';
    if (avgWordLength > 6 && lexicalDiversity > 0.7) return 'technical';
    if (lexicalDiversity > 0.6) return 'complex';
    if (lexicalDiversity > 0.4) return 'moderate';
    return 'simple';
  }

  private extractDomainJargon(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    const jargon: string[] = [];
    
    // Look for technical terms, abbreviations, and specialized vocabulary
    words.forEach(word => {
      if (word.length > 6 && !this.casualWords.includes(word) && !this.formalWords.includes(word)) {
        if (/^[A-Z]{2,}$/.test(word) || word.includes('-') || word.endsWith('tion') || word.endsWith('ment')) {
          jargon.push(word);
        }
      }
    });

    return [...new Set(jargon)].slice(0, 10);
  }

  private identifyFavoriteWords(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const frequency: { [key: string]: number } = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .filter(([, count]) => count > 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
  }

  private analyzeDictionLevel(text: string): 'concrete' | 'abstract' | 'mixed' {
    const abstractWords = ['concept', 'idea', 'theory', 'principle', 'notion', 'essence', 'significance', 'implication'];
    const concreteWords = ['table', 'house', 'car', 'book', 'computer', 'person', 'data', 'example'];
    
    const abstractCount = abstractWords.reduce((count, word) => 
      count + (text.toLowerCase().split(word).length - 1), 0);
    const concreteCount = concreteWords.reduce((count, word) => 
      count + (text.toLowerCase().split(word).length - 1), 0);

    if (abstractCount > concreteCount * 1.5) return 'abstract';
    if (concreteCount > abstractCount * 1.5) return 'concrete';
    return 'mixed';
  }

  private analyzeFormalityLevel(text: string): 'informal' | 'semi-formal' | 'formal' | 'academic' {
    const formalCount = this.formalWords.reduce((count, word) => 
      count + (text.toLowerCase().split(word.toLowerCase()).length - 1), 0);
    const casualCount = this.casualWords.reduce((count, word) => 
      count + (text.toLowerCase().split(word.toLowerCase()).length - 1), 0);
    const academicCount = this.academicKeywords.reduce((count, word) => 
      count + (text.toLowerCase().split(word.toLowerCase()).length - 1), 0);

    const totalWords = text.split(/\W+/).length;
    const academicRatio = academicCount / totalWords;
    const formalRatio = formalCount / totalWords;
    const casualRatio = casualCount / totalWords;

    if (academicRatio > 0.03) return 'academic';
    if (formalRatio > casualRatio * 2) return 'formal';
    if (casualRatio > formalRatio * 2) return 'informal';
    return 'semi-formal';
  }

  private detectContractions(text: string): boolean {
    return this.contractions.some(contraction => 
      text.toLowerCase().includes(contraction.toLowerCase()));
  }

  // SYNTACTIC ANALYSIS METHODS
  private analyzeSentenceVariety(metrics: AdvancedTextMetrics): 'uniform' | 'moderate' | 'highly-varied' {
    if (metrics.sentenceLengthVariation < 3) return 'uniform';
    if (metrics.sentenceLengthVariation < 8) return 'moderate';
    return 'highly-varied';
  }

  private analyzeSentenceComplexity(sentences: string[]): {
    simple: number;
    compound: number;
    complex: number;
    compoundComplex: number;
  } {
    let simple = 0, compound = 0, complex = 0, compoundComplex = 0;

    sentences.forEach(sentence => {
      const commaCount = (sentence.match(/,/g) || []).length;
      const coordinatingConjunctions = (sentence.match(/\b(and|but|or|nor|for|yet|so)\b/gi) || []).length;
      const subordinatingConjunctions = (sentence.match(/\b(because|since|while|although|if|when|where|that|which)\b/gi) || []).length;

      if (coordinatingConjunctions > 0 && subordinatingConjunctions > 0) {
        compoundComplex++;
      } else if (subordinatingConjunctions > 0 || commaCount > 2) {
        complex++;
      } else if (coordinatingConjunctions > 0 || commaCount > 0) {
        compound++;
      } else {
        simple++;
      }
    });

    const total = sentences.length;
    return {
      simple: simple / total,
      compound: compound / total,
      complex: complex / total,
      compoundComplex: compoundComplex / total
    };
  }

  private analyzeClauseUsage(text: string): string[] {
    const patterns: string[] = [];
    
    if (text.includes('which') || text.includes('that')) {
      patterns.push('Frequent relative clauses');
    }
    if (text.includes('because') || text.includes('since')) {
      patterns.push('Causal subordinate clauses');
    }
    if (text.includes('although') || text.includes('while')) {
      patterns.push('Concessive clauses');
    }
    
    return patterns;
  }

  private analyzeSentenceOpeners(sentences: string[]): string[] {
    const openers: { [key: string]: number } = {};
    
    sentences.forEach(sentence => {
      const firstWord = sentence.trim().split(/\s+/)[0]?.toLowerCase();
      if (firstWord) {
        openers[firstWord] = (openers[firstWord] || 0) + 1;
      }
    });

    return Object.entries(openers)
      .filter(([, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([opener]) => opener);
  }

  // RHETORICAL ANALYSIS METHODS
  private analyzeTone(text: string): string {
    const positiveWords = ['excellent', 'great', 'wonderful', 'fantastic', 'amazing'];
    const negativeWords = ['terrible', 'awful', 'horrible', 'disappointing', 'poor'];
    const neutralWords = ['standard', 'typical', 'normal', 'average', 'regular'];
    
    const positiveCount = positiveWords.reduce((count, word) => 
      count + (text.toLowerCase().split(word).length - 1), 0);
    const negativeCount = negativeWords.reduce((count, word) => 
      count + (text.toLowerCase().split(word).length - 1), 0);

    if (positiveCount > negativeCount) return 'optimistic';
    if (negativeCount > positiveCount) return 'critical';
    return 'neutral';
  }

  private analyzeMood(text: string): string {
    if (text.includes('!')) return 'enthusiastic';
    if (text.includes('?')) return 'inquisitive';
    if (text.toLowerCase().includes('concern') || text.toLowerCase().includes('worry')) return 'concerned';
    return 'measured';
  }

  private analyzeLogicalFlow(text: string): 'deductive' | 'inductive' | 'mixed' {
    const deductiveMarkers = ['therefore', 'thus', 'consequently', 'hence'];
    const inductiveMarkers = ['for example', 'specifically', 'in particular', 'such as'];
    
    const deductiveCount = deductiveMarkers.reduce((count, marker) => 
      count + (text.toLowerCase().split(marker).length - 1), 0);
    const inductiveCount = inductiveMarkers.reduce((count, marker) => 
      count + (text.toLowerCase().split(marker).length - 1), 0);

    if (deductiveCount > inductiveCount * 1.5) return 'deductive';
    if (inductiveCount > deductiveCount * 1.5) return 'inductive';
    return 'mixed';
  }

  private analyzeTransitions(text: string): string[] {
    const transitions: string[] = [];
    
    this.transitionWords.forEach(transition => {
      if (text.toLowerCase().includes(transition.toLowerCase())) {
        transitions.push(transition);
      }
    });

    return transitions.slice(0, 8);
  }

  private identifyRhetoricalDevices(text: string): string[] {
    const devices: string[] = [];
    
    if (text.includes('?')) devices.push('rhetorical questions');
    if (text.includes('like') || text.includes('as')) devices.push('similes');
    if (/\b(\w+)\s+\1\b/i.test(text)) devices.push('repetition');
    if (text.includes(':')) devices.push('explanatory colons');
    
    return devices;
  }

  private analyzeInformationPacing(text: string, metrics: AdvancedTextMetrics): 'dense' | 'moderate' | 'deliberate' {
    const informationDensity = (metrics.academicTerms + metrics.uniqueWords) / metrics.totalWords;
    
    if (informationDensity > 0.7) return 'dense';
    if (informationDensity > 0.5) return 'moderate';
    return 'deliberate';
  }

  // IDIOSYNCRATIC ANALYSIS METHODS
  private analyzePunctuationHabits(punctuationFrequency: { [key: string]: number }): string[] {
    const habits: string[] = [];
    const total = Object.values(punctuationFrequency).reduce((sum, count) => sum + count, 0);
    
    Object.entries(punctuationFrequency).forEach(([mark, count]) => {
      const ratio = count / total;
      if (ratio > 0.3) {
        habits.push(`Heavy use of ${mark === ',' ? 'commas' : mark === ';' ? 'semicolons' : mark}`);
      }
    });

    return habits;
  }

  private analyzeFormattingPreferences(text: string): string[] {
    const preferences: string[] = [];
    
    if (text.includes('*') || text.includes('**')) preferences.push('Emphasis with asterisks');
    if (text.includes('\n-') || text.includes('\n•')) preferences.push('Bullet point lists');
    if (text.includes('\n\n')) preferences.push('Frequent paragraph breaks');
    if (text.includes('(') && text.includes(')')) preferences.push('Parenthetical asides');
    
    return preferences;
  }

  private identifyFillerPhrases(text: string): string[] {
    const found: string[] = [];
    
    this.commonFillers.forEach(filler => {
      if (text.toLowerCase().includes(filler.toLowerCase())) {
        found.push(filler);
      }
    });

    return found;
  }

  private identifyWritingTics(text: string): string[] {
    const tics: string[] = [];
    
    if ((text.match(/\bactually\b/gi) || []).length > 2) tics.push('Frequent use of "actually"');
    if ((text.match(/\bobviously\b/gi) || []).length > 1) tics.push('Uses "obviously" for emphasis');
    if ((text.match(/\bclearly\b/gi) || []).length > 1) tics.push('Frequent "clearly" for emphasis');
    
    return tics;
  }

  // ANOMALY ANALYSIS METHODS
  private identifyCommonErrors(text: string): string[] {
    const errors: string[] = [];
    
    if (text.includes('its') && text.includes("it's")) {
      errors.push('Inconsistent its/it\'s usage');
    }
    if (text.includes('their') && text.includes('there')) {
      errors.push('Potential their/there confusion');
    }
    
    return errors;
  }

  private identifyAwkwardPhrasing(sentences: string[]): string[] {
    const awkward: string[] = [];
    
    sentences.forEach(sentence => {
      if (sentence.split(',').length > 4) {
        awkward.push('Overly complex comma usage');
      }
      if (sentence.split(' ').length > 40) {
        awkward.push('Extremely long sentences');
      }
    });

    return [...new Set(awkward)];
  }

  private identifyConsistentMistakes(text: string): string[] {
    const mistakes: string[] = [];
    
    // This would require more sophisticated analysis
    // For now, return empty array
    return mistakes;
  }

  // LEGACY COMPATIBILITY METHODS
  private determineSentenceComplexity(avgLength: number): 'simple' | 'moderate' | 'complex' {
    if (avgLength < 15) return 'simple';
    if (avgLength < 25) return 'moderate';
    return 'complex';
  }

  private determineVocabularyLevel(text: string): string {
    const academicRatio = this.academicKeywords.reduce((count, keyword) => 
      count + (text.toLowerCase().split(keyword.toLowerCase()).length - 1), 0) / text.split(/\W+/).length;
    
    if (academicRatio > 0.05) return 'Academic';
    if (academicRatio > 0.02) return 'Professional';
    return 'General';
  }

  private analyzeWritingPatterns(text: string, metrics: AdvancedTextMetrics): string[] {
    const patterns: string[] = [];
    
    if (metrics.avgWordsPerSentence > 20) {
      patterns.push('Complex, multi-clause sentences');
    }
    
    if (text.includes('therefore') || text.includes('consequently')) {
      patterns.push('Logical progression with transitional phrases');
    }
    
    if (text.includes('empirical') || text.includes('data') || text.includes('study')) {
      patterns.push('Evidence-based argumentation');
    }
    
    return patterns.length > 0 ? patterns : ['Direct and straightforward expression'];
  }

  private analyzeStructure(text: string): string[] {
    const preferences: string[] = [];
    
    if (text.includes('first') || text.includes('second') || text.includes('finally')) {
      preferences.push('Numbered or sequential organization');
    }
    
    if (text.includes('in conclusion') || text.includes('to summarize')) {
      preferences.push('Clear conclusions and summaries');
    }
    
    if (text.includes('for example') || text.includes('such as')) {
      preferences.push('Use of examples and illustrations');
    }
    
    return preferences.length > 0 ? preferences : ['Implicit organizational structure'];
  }

  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/).filter(word => 
      word.length > 4 && !this.transitionWords.includes(word)
    );
    
    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private calculateReadabilityScore(metrics: AdvancedTextMetrics): number {
    const avgSentenceLength = metrics.avgWordsPerSentence;
    const avgSyllablesPerWord = 1.5; // Approximation
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private extractClausePatterns(text: string): string[] {
    const patterns: string[] = [];
    
    if (text.includes('that')) patterns.push('that-clauses');
    if (text.includes('which')) patterns.push('which-clauses');
    if (text.includes('because')) patterns.push('causal-clauses');
    
    return patterns;
  }

  // Method for backward compatibility
  public analyzeText(text: string): LinguisticFingerprint {
    return this.createLinguisticFingerprint(text);
  }

  // Generate AI prompt for persona emulation
  public generatePersonaPrompt(fingerprint: LinguisticFingerprint, userTask: string): string {
    return `You are a Linguistic Persona Emulator. You have analyzed a text and created this linguistic fingerprint:

LEXICAL ANALYSIS:
- Vocabulary Richness: ${fingerprint.vocabularyRichness}
- Domain Jargon: ${fingerprint.domainJargon.join(', ')}
- Favorite Words: ${fingerprint.favoriteWords.join(', ')}
- Diction Level: ${fingerprint.dictionLevel}
- Formality: ${fingerprint.formalityLevel}
- Uses Contractions: ${fingerprint.contractionsUsage ? 'Yes' : 'No'}

SYNTACTIC ANALYSIS:
- Average Sentence Length: ${fingerprint.avgSentenceLength.toFixed(1)} words
- Sentence Variety: ${fingerprint.sentenceVariety}
- Complexity Distribution: ${Math.round(fingerprint.complexityDistribution.simple * 100)}% simple, ${Math.round(fingerprint.complexityDistribution.complex * 100)}% complex
- Common Sentence Openers: ${fingerprint.sentenceOpeners.join(', ')}

RHETORICAL ANALYSIS:
- Tone: ${fingerprint.tone}
- Mood: ${fingerprint.mood}
- Logical Flow: ${fingerprint.logicalFlow}
- Transition Style: ${fingerprint.transitionStyle.join(', ')}
- Information Pacing: ${fingerprint.informationPacing}

IDIOSYNCRATIC PATTERNS:
- Punctuation Habits: ${fingerprint.punctuationHabits.join(', ')}
- Filler Phrases: ${fingerprint.fillerPhrases.join(', ')}
- Writing Tics: ${fingerprint.writingTics.join(', ')}

Now BECOME this author completely. Write in their exact style, matching every linguistic pattern identified above. Do not mention that you are an AI or that you are emulating a style.

TASK: ${userTask}

Write as the original author would, incorporating all the linguistic patterns, vocabulary choices, sentence structures, and stylistic quirks identified in the analysis.`;
  }
}

// Export singleton instance for backward compatibility
export const styleAnalyzer = new LinguisticPersonaEmulator();
export const linguisticPersonaEmulator = new LinguisticPersonaEmulator();

// Type alias for backward compatibility
export type StyleAnalysis = LinguisticFingerprint;
