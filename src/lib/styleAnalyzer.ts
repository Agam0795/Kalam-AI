// Core Style Analysis Engine for Kalam AI
// Advanced Linguistic Persona Emulator with 5-dimensional analysis

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

export interface TextMetrics {
  totalWords: number;
  uniqueWords: number;
  avgWordsPerSentence: number;
  sentences: string[];
  complexSentences: number;
  academicTerms: number;
  passiveVoiceCount: number;
  paragraphs: string[];
  punctuationFrequency: { [key: string]: number };
  clausePatterns: string[];
}

export class AdvancedStyleAnalyzer {
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

  private rhetoricalDevices = [
    'metaphor', 'analogy', 'rhetorical question', 'parallelism', 'repetition',
    'alliteration', 'hyperbole', 'irony', 'simile', 'personification'
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
      sentenceVariety: this.analyzeSentenceVariety(metrics.sentences),
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

  // Legacy method for backward compatibility
  public analyzeText(text: string): LinguisticFingerprint {
    return this.createLinguisticFingerprint(text);
  }

  private calculateAdvancedMetrics(text: string): TextMetrics {
    // Clean and normalize text
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Split into sentences (more sophisticated splitting)
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Split into paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Extract words (alphanumeric only)
    const words = cleanText.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = new Set(words).size;
    
    // Calculate complex sentences (those with subordinate clauses)
    const complexSentences = sentences.filter(sentence => 
      /\b(although|because|since|while|whereas|if|unless|when|where|that|which|who)\b/i.test(sentence)
    ).length;

    // Count academic terms
    const academicTerms = words.filter(word => 
      this.academicKeywords.includes(word.toLowerCase())
    ).length;

    // Count passive voice constructions
    const passiveVoiceCount = (cleanText.match(/\b(was|were|is|are|been|being)\s+\w+ed\b/gi) || []).length;

    // Analyze punctuation frequency
    const punctuationFrequency: { [key: string]: number } = {};
    const punctuation = text.match(/[.!?,:;()"-]/g) || [];
    punctuation.forEach(p => {
      punctuationFrequency[p] = (punctuationFrequency[p] || 0) + 1;
    });

    // Analyze clause patterns
    const clausePatterns = this.extractClausePatterns(sentences);

    return {
      totalWords: words.length,
      uniqueWords,
      avgWordsPerSentence: words.length / sentences.length,
      sentences,
      complexSentences,
      academicTerms,
      passiveVoiceCount,
      paragraphs,
      punctuationFrequency,
      clausePatterns
    };
  }

  private extractClausePatterns(sentences: string[]): string[] {
    const patterns: string[] = [];
    sentences.forEach(sentence => {
      if (/\b(although|because|since|while|whereas)\b/i.test(sentence)) {
        patterns.push('subordinate clause');
      }
      if (/,.*,/.test(sentence)) {
        patterns.push('embedded clause');
      }
      if (/\b(and|but|or)\b/.test(sentence)) {
        patterns.push('coordinate clause');
      }
    });
    return [...new Set(patterns)];
  }

  // Lexical Analysis Methods
  private analyzeVocabularyRichness(text: string, metrics: TextMetrics): 'simple' | 'moderate' | 'complex' | 'academic' | 'technical' {
    const lexicalDiversity = metrics.uniqueWords / metrics.totalWords;
    const longWordRatio = text.split(/\s+/).filter(word => word.length > 6).length / metrics.totalWords;
    const academicRatio = metrics.academicTerms / metrics.totalWords;

    if (academicRatio > 0.05) return 'academic';
    if (longWordRatio > 0.3) return 'technical';
    if (lexicalDiversity > 0.6) return 'complex';
    if (lexicalDiversity > 0.4) return 'moderate';
    return 'simple';
  }

  private extractDomainJargon(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    const technicalTerms = words.filter(word => 
      word.length > 8 && 
      !this.casualWords.includes(word) &&
      !this.formalWords.includes(word)
    );
    return [...new Set(technicalTerms)].slice(0, 10);
  }

  private identifyFavoriteWords(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .filter(([, count]) => count > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private analyzeDictionLevel(text: string): 'concrete' | 'abstract' | 'mixed' {
    const concreteWords = ['table', 'chair', 'car', 'house', 'tree', 'water', 'food', 'person', 'place'];
    const abstractWords = ['idea', 'concept', 'theory', 'philosophy', 'emotion', 'thought', 'principle', 'value'];
    
    const words = text.toLowerCase().split(/\W+/);
    const concreteCount = words.filter(word => concreteWords.some(c => word.includes(c))).length;
    const abstractCount = words.filter(word => abstractWords.some(a => word.includes(a))).length;
    
    if (abstractCount > concreteCount * 1.5) return 'abstract';
    if (concreteCount > abstractCount * 1.5) return 'concrete';
    return 'mixed';
  }

  private analyzeFormalityLevel(text: string): 'informal' | 'semi-formal' | 'formal' | 'academic' {
    const words = text.toLowerCase().split(/\W+/);
    const formalCount = words.filter(word => this.formalWords.includes(word)).length;
    const casualCount = words.filter(word => this.casualWords.includes(word)).length;
    const academicCount = words.filter(word => this.academicKeywords.includes(word)).length;
    
    const total = words.length;
    const academicRatio = academicCount / total;
    const formalRatio = formalCount / total;
    const casualRatio = casualCount / total;
    
    if (academicRatio > 0.03) return 'academic';
    if (formalRatio > casualRatio * 2) return 'formal';
    if (casualRatio > formalRatio) return 'informal';
    return 'semi-formal';
  }

  private detectContractions(text: string): boolean {
    const contractions = /\b(don't|won't|can't|shouldn't|wouldn't|couldn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|doesn't|didn't|it's|you're|we're|they're|I'm|he's|she's|that's|what's|where's|who's|how's|let's)\b/gi;
    return contractions.test(text);
  }

  // Syntactic Analysis Methods
  private analyzeSentenceVariety(sentences: string[]): 'uniform' | 'moderate' | 'highly-varied' {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev > 8) return 'highly-varied';
    if (stdDev > 4) return 'moderate';
    return 'uniform';
  }

  private analyzeSentenceComplexity(sentences: string[]): {
    simple: number;
    compound: number;
    complex: number;
    compoundComplex: number;
  } {
    let simple = 0, compound = 0, complex = 0, compoundComplex = 0;
    
    sentences.forEach(sentence => {
      const hasCoordinating = /\b(and|but|or|nor|for|yet|so)\b/i.test(sentence);
      const hasSubordinating = /\b(although|because|since|while|whereas|if|unless|when|where|that|which|who)\b/i.test(sentence);
      
      if (hasCoordinating && hasSubordinating) {
        compoundComplex++;
      } else if (hasSubordinating) {
        complex++;
      } else if (hasCoordinating) {
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
    const clauses: string[] = [];
    if (/\b(although|even though)\b/i.test(text)) clauses.push('concessive');
    if (/\b(because|since|as)\b/i.test(text)) clauses.push('causal');
    if (/\b(if|unless|provided that)\b/i.test(text)) clauses.push('conditional');
    if (/\b(when|while|before|after)\b/i.test(text)) clauses.push('temporal');
    if (/\b(where|wherever)\b/i.test(text)) clauses.push('locative');
    return clauses;
  }

  private analyzeSentenceOpeners(sentences: string[]): string[] {
    const openers: string[] = [];
    sentences.forEach(sentence => {
      const firstWord = sentence.trim().split(/\s+/)[0]?.toLowerCase();
      if (firstWord) {
        if (['however', 'therefore', 'moreover', 'furthermore'].includes(firstWord)) {
          openers.push('transitional');
        } else if (['although', 'because', 'since', 'while'].includes(firstWord)) {
          openers.push('subordinate clause');
        } else if (['and', 'but', 'or'].includes(firstWord)) {
          openers.push('coordinating');
        } else if (['the', 'a', 'an'].includes(firstWord)) {
          openers.push('article');
        } else {
          openers.push('direct');
        }
      }
    });
    return [...new Set(openers)];
  }

  // Rhetorical Analysis Methods
  private analyzeMood(text: string): string {
    const positive = ['excellent', 'great', 'wonderful', 'amazing', 'fantastic', 'brilliant'];
    const negative = ['terrible', 'awful', 'horrible', 'disappointing', 'frustrating'];
    const neutral = ['okay', 'fine', 'acceptable', 'adequate', 'standard'];
    
    const words = text.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(w => positive.includes(w)).length;
    const negativeCount = words.filter(w => negative.includes(w)).length;
    const neutralCount = words.filter(w => neutral.includes(w)).length;
    
    if (positiveCount > negativeCount + neutralCount) return 'optimistic';
    if (negativeCount > positiveCount + neutralCount) return 'pessimistic';
    return 'neutral';
  }

  private analyzeLogicalFlow(text: string): 'deductive' | 'inductive' | 'mixed' {
    const deductiveMarkers = ['therefore', 'thus', 'consequently', 'hence', 'it follows that'];
    const inductiveMarkers = ['for example', 'for instance', 'such as', 'specifically', 'in particular'];
    
    const deductiveCount = deductiveMarkers.reduce((count, marker) => {
      return count + (text.toLowerCase().includes(marker) ? 1 : 0);
    }, 0);
    
    const inductiveCount = inductiveMarkers.reduce((count, marker) => {
      return count + (text.toLowerCase().includes(marker) ? 1 : 0);
    }, 0);
    
    if (deductiveCount > inductiveCount) return 'deductive';
    if (inductiveCount > deductiveCount) return 'inductive';
    return 'mixed';
  }

  private analyzeTransitions(text: string): string[] {
    const transitions: string[] = [];
    this.transitionWords.forEach(word => {
      if (text.toLowerCase().includes(word)) {
        transitions.push(word);
      }
    });
    return transitions.slice(0, 5);
  }

  private identifyRhetoricalDevices(text: string): string[] {
    const devices: string[] = [];
    
    if (/\?/.test(text)) devices.push('rhetorical question');
    if (/\b(\w+)\s+\1\b/i.test(text)) devices.push('repetition');
    if (/like|as.*as|similar to/i.test(text)) devices.push('simile');
    if (/is|are.*metaphor|metaphorically/i.test(text)) devices.push('metaphor');
    if (/\b(\w)\1+\b/.test(text)) devices.push('alliteration');
    
    return devices;
  }

  private analyzeInformationPacing(text: string, metrics: TextMetrics): 'dense' | 'moderate' | 'deliberate' {
    const avgSentenceLength = metrics.avgWordsPerSentence;
    const complexSentenceRatio = metrics.complexSentences / metrics.sentences.length;
    
    if (avgSentenceLength > 25 && complexSentenceRatio > 0.6) return 'dense';
    if (avgSentenceLength < 15 && complexSentenceRatio < 0.3) return 'deliberate';
    return 'moderate';
  }

  // Idiosyncratic Analysis Methods
  private analyzePunctuationHabits(punctuationFreq: { [key: string]: number }): string[] {
    const habits: string[] = [];
    const total = Object.values(punctuationFreq).reduce((a, b) => a + b, 0);
    
    if ((punctuationFreq[','] || 0) / total > 0.4) habits.push('heavy comma usage');
    if ((punctuationFreq[';'] || 0) > 0) habits.push('semicolon preference');
    if ((punctuationFreq['!'] || 0) > (punctuationFreq['.'] || 0) * 0.1) habits.push('exclamatory style');
    if ((punctuationFreq['?'] || 0) > 0) habits.push('questioning approach');
    if ((punctuationFreq['"'] || 0) > 0) habits.push('quotation usage');
    
    return habits;
  }

  private analyzeFormattingPreferences(text: string): string[] {
    const preferences: string[] = [];
    
    if (/\n\s*\n/.test(text)) preferences.push('paragraph breaks');
    if (/^\s*[-*]\s/m.test(text)) preferences.push('bullet points');
    if (/^\s*\d+\.\s/m.test(text)) preferences.push('numbered lists');
    if (/[A-Z]{2,}/.test(text)) preferences.push('capitalization emphasis');
    if (/\*\w+\*/.test(text)) preferences.push('asterisk emphasis');
    
    return preferences;
  }

  private identifyFillerPhrases(text: string): string[] {
    const fillers = ['you know', 'i mean', 'sort of', 'kind of', 'like', 'basically', 'actually', 'literally'];
    const found: string[] = [];
    
    fillers.forEach(filler => {
      if (text.toLowerCase().includes(filler)) {
        found.push(filler);
      }
    });
    
    return found;
  }

  private identifyWritingTics(text: string): string[] {
    const tics: string[] = [];
    
    if (/\.\.\./g.test(text)) tics.push('ellipsis usage');
    if (/--/g.test(text)) tics.push('dash preference');
    if (/\([^)]*\)/g.test(text)) tics.push('parenthetical asides');
    if (/\/\w+\//g.test(text)) tics.push('slash notation');
    if (/\b(very|really|quite|rather)\s/gi.test(text)) tics.push('intensive adverbs');
    
    return tics;
  }

  // Anomaly Analysis Methods
  private identifyCommonErrors(text: string): string[] {
    const errors: string[] = [];
    
    if (/\bits\s/g.test(text) && /\bit's\s/g.test(text)) errors.push('its/it\'s confusion');
    if (/\byour\s/g.test(text) && /\byou're\s/g.test(text)) errors.push('your/you\'re mixing');
    if (/\bthen\s/g.test(text) && /\bthan\s/g.test(text)) errors.push('then/than usage');
    if (/\baffect\s/g.test(text) && /\beffect\s/g.test(text)) errors.push('affect/effect confusion');
    if (/  +/g.test(text)) errors.push('double spacing');
    
    return errors;
  }

  private identifyAwkwardPhrasing(sentences: string[]): string[] {
    const awkward: string[] = [];
    
    sentences.forEach(sentence => {
      if (sentence.split(/\s+/).length > 30) awkward.push('overly long sentence');
      if (/\bof\s+of\b/i.test(sentence)) awkward.push('repeated prepositions');
      if (/\bthat\s+that\b/i.test(sentence)) awkward.push('repeated conjunctions');
      if (/\bthe\s+the\b/i.test(sentence)) awkward.push('repeated articles');
    });
    
    return [...new Set(awkward)];
  }

  private identifyConsistentMistakes(text: string): string[] {
    const mistakes: string[] = [];
    
    // Check for consistent spelling patterns
    if ((text.match(/\bcolor\b/g) || []).length > 0 && (text.match(/\bcolour\b/g) || []).length > 0) {
      mistakes.push('mixed spelling conventions');
    }
    
    // Check for inconsistent capitalization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let inconsistentCaps = 0;
    sentences.forEach(sentence => {
      const firstChar = sentence.trim()[0];
      if (firstChar && firstChar !== firstChar.toUpperCase()) {
        inconsistentCaps++;
      }
    });
    
    if (inconsistentCaps > sentences.length * 0.1) {
      mistakes.push('inconsistent capitalization');
    }
    
    return mistakes;
  }

  // Legacy compatibility methods
  private determineSentenceComplexity(avgLength: number): 'simple' | 'moderate' | 'complex' {
    if (avgLength > 20) return 'complex';
    if (avgLength > 12) return 'moderate';
    return 'simple';
  }

  private determineVocabularyLevel(text: string): string {
    const words = text.toLowerCase().split(/\W+/);
    const longWords = words.filter(word => word.length > 6).length;
    const ratio = longWords / words.length;
    
    if (ratio > 0.3) return 'Advanced academic vocabulary';
    if (ratio > 0.2) return 'Professional vocabulary';
    return 'General vocabulary';
  }

  private analyzeWritingPatterns(text: string, metrics: TextMetrics): string[] {
    const patterns: string[] = [];
    
    if (metrics.passiveVoiceCount > metrics.sentences.length * 0.2) {
      patterns.push('Frequent use of passive voice');
    }
    
    if (metrics.avgWordsPerSentence > 20) {
      patterns.push('Complex, multi-clause sentences');
    }
    
    if (text.includes('therefore') || text.includes('consequently')) {
      patterns.push('Logical progression with transitional phrases');
    }
    
    if (text.includes('empirical') || text.includes('data') || text.includes('study')) {
      patterns.push('Evidence-based argumentation');
    }
    
    if ((text.match(/,/g) || []).length > metrics.sentences.length * 2) {
      patterns.push('Heavy use of subordinate clauses');
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
    // Simple keyword extraction based on frequency and importance
    const words = text.toLowerCase().split(/\W+/).filter(word => 
      word.length > 4 && !['therefore', 'however', 'moreover', 'furthermore'].includes(word)
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

  private calculateReadabilityScore(metrics: TextMetrics): number {
    // Simplified Flesch Reading Ease calculation
    const avgSentenceLength = metrics.avgWordsPerSentence;
    const avgSyllablesPerWord = 1.5; // Approximation
    
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private analyzeTone(text: string): string {
    const positiveWords = ['excellent', 'outstanding', 'remarkable', 'significant', 'important', 'valuable'];
    const neutralWords = ['however', 'therefore', 'moreover', 'furthermore', 'consequently'];
    const criticalWords = ['however', 'nevertheless', 'limited', 'insufficient', 'problematic'];
    
    const words = text.toLowerCase().split(/\W+/);
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const criticalCount = words.filter(w => criticalWords.includes(w)).length;
    const neutralCount = words.filter(w => neutralWords.includes(w)).length;
    
    if (criticalCount > positiveCount) return 'Critical and analytical';
    if (positiveCount > neutralCount) return 'Optimistic and assertive';
    return 'Balanced and objective';
  }
}

// Export singleton instance
export const styleAnalyzer = new AdvancedStyleAnalyzer();
