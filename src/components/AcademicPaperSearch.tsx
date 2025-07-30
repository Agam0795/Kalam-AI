'use client';

import { useState } from 'react';
import { Search, User, BookOpen, ExternalLink, Quote, Calendar, Building } from 'lucide-react';

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

  const searchPapers = async () => {
    if (!authorName.trim()) {
      setError('Please enter an author name');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults(null);

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
        setError(data.message || 'No papers found for this author');
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

  const truncateAbstract = (abstract: string, maxLength: number = 200) => {
    if (abstract.length <= maxLength) return abstract;
    return abstract.slice(0, maxLength) + '...';
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Author/Professor Name *
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Geoffrey Hinton, Yann LeCun, Fei-Fei Li"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            University/Affiliation (optional)
          </label>
          <input
            type="text"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Stanford University, MIT, Google AI"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          onClick={searchPapers}
          disabled={isLoading || !authorName.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Searching Papers...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search Papers
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Author Information */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <User className="h-6 w-6 text-indigo-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {results.selectedAuthor.name}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {results.selectedAuthor.affiliations.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{results.selectedAuthor.affiliations.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {results.selectedAuthor.paperCount} papers
                    </span>
                    <span className="flex items-center gap-1">
                      <Quote className="h-4 w-4" />
                      {results.selectedAuthor.citationCount} citations
                    </span>
                    <span>h-index: {results.selectedAuthor.hIndex}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Authors */}
          {results.alternativeAuthors.length > 1 && (
            <div className="border-l-4 border-yellow-400 pl-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Note:</strong> Found multiple authors with similar names. Showing results for the most relevant match.
              </p>
              <details className="text-sm">
                <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                  View other possible matches ({results.alternativeAuthors.length - 1})
                </summary>
                <div className="mt-2 space-y-1">
                  {results.alternativeAuthors.slice(1).map((author) => (
                    <div key={author.id} className="text-gray-600 dark:text-gray-400">
                      {author.name} - {author.affiliations.join(', ')} ({author.paperCount} papers)
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}

          {/* Papers List */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Publications ({results.totalFound} found)
            </h4>
            
            <div className="space-y-4">
              {results.papers.map((paper) => (
                <div key={paper.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    {/* Paper Title */}
                    <h5 className="font-semibold text-gray-800 dark:text-white leading-tight">
                      {paper.title}
                    </h5>

                    {/* Authors and Meta */}
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
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
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {truncateAbstract(paper.abstract)}
                    </p>

                    {/* Links */}
                    <div className="flex flex-wrap gap-2">
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
              ))}
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
