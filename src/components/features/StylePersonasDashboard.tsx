'use client';

import { useState, useEffect } from 'react';
import { Sparkles, User, FileText, Clock, CheckCircle, AlertCircle, Trash2, Eye, Play, Plus } from 'lucide-react';

interface StylePersona {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  sourceCount: number;
  sourcePapers: Array<{
    id: string;
    title: string;
    authors: string[];
    year: number;
  }>;
  createdAt: string;
  analysisComplete?: boolean;
  styleProfile?: {
    tone: string;
    keywords: string[];
    sentenceStyle: string;
    complexity: 'simple' | 'moderate' | 'complex';
    formalityLevel: 'casual' | 'professional' | 'academic';
  };
  errorMessage?: string;
}

export default function StylePersonasDashboard() {
  const [personas, setPersonas] = useState<StylePersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<StylePersona | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch personas from API
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await fetch('/api/personas', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPersonas(data.personas || []);
      } catch (error) {
        console.error('Error fetching personas:', error);
        // Set empty array as fallback
        setPersonas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  const getStatusIcon = (status: StylePersona['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-amber-500 animate-pulse" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: StylePersona['status']) => {
    switch (status) {
      case 'processing':
        return 'Processing...';
      case 'ready':
        return 'Ready';
      case 'error':
        return 'Error';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUsePersona = (persona: StylePersona) => {
    // TODO: Integrate with main generation interface
    alert(`Applying "${persona.name}" style persona to the generation interface!`);
  };

  const handleDeletePersona = async (personaId: string) => {
    if (!confirm('Are you sure you want to delete this style persona? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/personas?id=${personaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPersonas(personas.filter(p => p.id !== personaId));
      } else {
        const data = await response.json();
        alert(`Failed to delete persona: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting persona:', error);
      alert('Failed to delete persona. Please try again.');
    }
  };

  const handleViewDetails = (persona: StylePersona) => {
    setSelectedPersona(persona);
    setShowDetails(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Style Personas
          </h2>
        </div>
        <button
          onClick={() => {
            // TODO: Navigate to academic search
            alert('Navigate to Academic Search to create new personas');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Persona
        </button>
      </div>

      {personas.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No Style Personas Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first style persona by analyzing academic papers from the Academic Search tab.
          </p>
          <button
            onClick={() => {
              // TODO: Navigate to academic search
              alert('Navigate to Academic Search to create your first persona');
            }}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {persona.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(persona.status)}
                      <span className={`text-sm font-medium ${
                        persona.status === 'ready' ? 'text-green-600' :
                        persona.status === 'processing' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {getStatusText(persona.status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {persona.sourceCount} paper{persona.sourceCount !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(persona.createdAt)}
                    </span>
                  </div>

                  {persona.status === 'ready' && persona.styleProfile && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Tone:</span>
                          <p className="text-gray-600 dark:text-gray-400">{persona.styleProfile.tone}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Complexity:</span>
                          <p className="text-gray-600 dark:text-gray-400 capitalize">{persona.styleProfile.complexity}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Style:</span>
                          <p className="text-gray-600 dark:text-gray-400">{persona.styleProfile.sentenceStyle}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Key Terms:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {persona.styleProfile.keywords.slice(0, 5).map((keyword, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                          {persona.styleProfile.keywords.length > 5 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{persona.styleProfile.keywords.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {persona.status === 'error' && persona.errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-700 dark:text-red-300">{persona.errorMessage}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {persona.status === 'ready' && (
                    <button
                      onClick={() => handleUsePersona(persona)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      Use Style
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(persona)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                    Details
                  </button>
                  <button
                    onClick={() => handleDeletePersona(persona.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedPersona && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {selectedPersona.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedPersona.status)}
                    <span className={`text-sm font-medium ${
                      selectedPersona.status === 'ready' ? 'text-green-600' :
                      selectedPersona.status === 'processing' ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {getStatusText(selectedPersona.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close details"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Source Papers */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Source Papers ({selectedPersona.sourceCount})
                  </h4>
                  <div className="space-y-3">
                    {selectedPersona.sourcePapers.map((paper) => (
                      <div key={paper.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                        <h5 className="font-medium text-gray-800 dark:text-white text-sm mb-1">
                          {paper.title}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {paper.authors.join(', ')} • {paper.year}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Style Analysis */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Style Analysis
                  </h4>
                  {selectedPersona.status === 'ready' && selectedPersona.styleProfile ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Writing Characteristics</h5>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Tone:</span> {selectedPersona.styleProfile.tone}
                          </div>
                          <div>
                            <span className="font-medium">Formality:</span> {selectedPersona.styleProfile.formalityLevel}
                          </div>
                          <div>
                            <span className="font-medium">Complexity:</span> {selectedPersona.styleProfile.complexity}
                          </div>
                          <div>
                            <span className="font-medium">Sentence Style:</span> {selectedPersona.styleProfile.sentenceStyle}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Key Vocabulary</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedPersona.styleProfile.keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : selectedPersona.status === 'processing' ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Analysis in progress... This may take several minutes.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600 dark:text-red-400 mb-2">Analysis Failed</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedPersona.errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Close
                </button>
                {selectedPersona.status === 'ready' && (
                  <button
                    onClick={() => {
                      handleUsePersona(selectedPersona);
                      setShowDetails(false);
                    }}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Use This Style
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
