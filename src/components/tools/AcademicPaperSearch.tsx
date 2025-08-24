'use client';

import { useState } from 'react';
import { Search, User, BookOpen, ExternalLink, Quote, Calendar, Building, Download, Lock, CheckSquare, Square, Sparkles, FileText, AlertCircle } from 'lucide-react';

interface Author {
  id: string;
  name: string;
  affiliations: string[];
  paperCount: number;
  citationCount: number;
  hIndex: number;
}

interface Paper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  abstract: string;
  citationCount: number;
  isOpenAccess?: boolean;
  pdfUrl?: string;
  links: {
    semanticScholar: string;
    doi?: string;
    arxiv?: string;
    pubmed?: string;
  };
}

interface SearchResults {
  selectedAuthor: Author;
  alternativeAuthors: Author[];
  papers: Paper[];
  totalFound: number;
}

export default function AcademicPaperSearch() {
  const [authorName, setAuthorName] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [personaName, setPersonaName] = useState('');

  const searchPapers = async () => {
    if (!authorName.trim()) {
      setError('Please enter an author name');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);
    setSelectedPapers(new Set());

    try {
      const response = await fetch('/api/fetch-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorName: authorName.trim(),
          affiliation: affiliation.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch papers');
      }

      if (data.papers && data.papers.length > 0) {
        setResults(data);
      } else {
        let errorMessage = data.message || 'No papers found for this author';
        if (data.suggestions && data.suggestions.length > 0) {
          errorMessage += '\n\nSuggestions:\n• ' + data.suggestions.join('\n• ');
        }
        setError(errorMessage);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'An error occurred while searching');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPapers();
    }
  };

  const togglePaperSelection = (paperId: string) => {
    const newSelected = new Set(selectedPapers);
    if (newSelected.has(paperId)) {
      newSelected.delete(paperId);
    } else {
      newSelected.add(paperId);
    }
    setSelectedPapers(newSelected);
  };

  const handleCreateStylePersona = () => {
    setShowCreateModal(true);
  };

  const getPdfAccessLevel = (paper: Paper): 'open' | 'restricted' | 'none' => {
    if (paper.isOpenAccess || paper.links.arxiv) return 'open';
    if (paper.pdfUrl || paper.links.doi) return 'restricted';
    return 'none';
  };

  const truncateAbstract = (abstract: string, maxLength: number = 200) => {
    if (abstract.length <= maxLength) return abstract;
    return abstract.slice(0, maxLength) + '...';
  };

  const confirmCreatePersona = async () => {
    if (!personaName.trim()) {
      alert('Please enter a name for the style persona');
      return;
    }

    if (!results) {
      alert('No papers available for analysis');
      return;
    }

    setShowCreateModal(false);
    
    try {
      // Prepare selected papers data
      const selectedPapersData = results.papers
        .filter(paper => selectedPapers.has(paper.id))
        .map(paper => ({
          id: paper.id,
          title: paper.title,
          authors: paper.authors,
          abstract: paper.abstract,
          url: paper.links.semanticScholar,
          pdfUrl: paper.pdfUrl,
          isOpenAccess: paper.isOpenAccess
        }));

      const response = await fetch('/api/create-persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: personaName,
          selectedPapers: selectedPapersData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create style persona');
      }

      // Clear selections and show success
      setSelectedPapers(new Set());
      setPersonaName('');
      
      alert(`🎉 Style persona "${personaName}" created successfully! Check the Style Personas tab to see the analysis results.`);
      
    } catch (error) {
      console.error('Error creating persona:', error);
      alert(`Failed to create style persona: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowCreateModal(true); // Reopen modal on error
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Academic Paper Search
        </h2>
      </div>

      {/* Search Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Author Name
          </label>
          <input
            id="author"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Geoffrey Hinton, Yann LeCun, Yoshua Bengio"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            spellCheck="false"
            data-ms-editor="true"
          />
        </div>

        <div>
          <label htmlFor="affiliation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Institution/Affiliation (optional)
          </label>
          <input
            id="affiliation"
            type="text"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Stanford University, Google DeepMind"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            spellCheck="false"
            data-ms-editor="true"
          />
        </div>

        <button
          onClick={searchPapers}
          disabled={isLoading || !authorName.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search Papers
            </>
          )}
        </button>
      </div>

      {/* Quick Examples */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Quick Examples:</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Geoffrey Hinton', affiliation: 'University of Toronto' },
            { name: 'Yann LeCun', affiliation: 'Meta AI' },
            { name: 'Andrew Ng', affiliation: 'Stanford University' }
          ].map((example) => (
            <button
              key={example.name}
              onClick={() => {
                setAuthorName(example.name);
                setAffiliation(example.affiliation);
              }}
              className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 rounded transition-colors"
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">Search Error</h4>
              <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">{error}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Selected Author Info */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-start gap-3">
              <User className="h-6 w-6 text-indigo-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {results.selectedAuthor.name}
                </h3>
                {(results.selectedAuthor.affiliations || []).length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {(results.selectedAuthor.affiliations || []).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{results.selectedAuthor.paperCount} papers</span>
                  <span>{results.selectedAuthor.citationCount} citations</span>
                  <span>h-index: {results.selectedAuthor.hIndex}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Papers List */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Papers ({results.papers.length})
            </h4>
            
            <div className="space-y-4">
              {results.papers.map((paper) => {
                const pdfAccess = getPdfAccessLevel(paper);
                const isSelected = selectedPapers.has(paper.id);
                
                return (
                  <div 
                    key={paper.id} 
                    className={`border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection checkbox */}
                      <button
                        onClick={() => togglePaperSelection(paper.id)}
                        className="mt-1 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={pdfAccess === 'none'}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        {/* Paper Title with PDF indicator */}
                        <div className="flex items-start gap-2">
                          <h5 className="font-semibold text-gray-800 dark:text-white leading-tight flex-1">
                            {paper.title}
                          </h5>
                          <div className="flex items-center gap-1 mt-1">
                            {pdfAccess === 'open' && (
                              <div className="relative group">
                                <Download className="h-4 w-4 text-green-600" />
                                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  Open Access PDF available
                                </div>
                              </div>
                            )}
                            {pdfAccess === 'restricted' && (
                              <div className="relative group">
                                <Lock className="h-4 w-4 text-gray-500" />
                                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  PDF may be behind paywall
                                </div>
                              </div>
                            )}
                            {pdfAccess === 'none' && (
                              <div className="relative group">
                                <FileText className="h-4 w-4 text-gray-300" />
                                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  No PDF available for analysis
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Authors and Meta */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{paper.authors.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {paper.year}
                            </span>
                            <span>{paper.venue}</span>
                            <span className="flex items-center gap-1">
                              <Quote className="h-4 w-4" />
                              {paper.citationCount} citations
                            </span>
                          </div>
                        </div>

                        {/* Abstract */}
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
                          {truncateAbstract(paper.abstract)}
                        </p>

                        {/* Links */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          <a
                            href={paper.links.semanticScholar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md text-sm transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Semantic Scholar
                          </a>
                          
                          {paper.links.doi && (
                            <a
                              href={paper.links.doi}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              DOI
                            </a>
                          )}
                          
                          {paper.links.arxiv && (
                            <a
                              href={paper.links.arxiv}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              arXiv
                            </a>
                          )}
                          
                          {paper.links.pubmed && (
                            <a
                              href={paper.links.pubmed}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              PubMed
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Action Bar */}
      {selectedPapers.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {selectedPapers.size} paper{selectedPapers.size !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ready to analyze writing style
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedPapers(new Set())}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Clear Selection
              </button>
              <button
                onClick={handleCreateStylePersona}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Create Style Persona...
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Style Persona Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Create Style Persona
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close modal"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Persona Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name this Style Persona
                </label>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  placeholder="e.g., 'Geoffrey Hinton - Deep Learning' or 'My Favorite NLP Papers'"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  spellCheck="false"
                  data-ms-editor="true"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Choose a descriptive name to identify this writing style later
                </p>
              </div>

              {/* Selected Papers List */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected Papers ({selectedPapers.size})
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {results?.papers.filter(paper => selectedPapers.has(paper.id)).map((paper) => (
                    <div key={paper.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <CheckSquare className="h-4 w-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {paper.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {paper.authors.join(', ')} • {paper.year}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning Message */}
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Intensive AI Analysis
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      This process analyzes the full content of each selected paper to learn writing patterns, 
                      vocabulary, and style. It may take several minutes to complete. You&apos;ll be notified when 
                      the persona is ready for use.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCreatePersona}
                  disabled={!personaName.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Confirm & Begin Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Data sourced from Semantic Scholar API. Results include links to original sources. 
          All papers remain on their original platforms - no copyrighted content is stored.
        </p>
      </div>
    </div>
  );
}
