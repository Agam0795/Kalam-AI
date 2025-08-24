'use client';

import { useState, useEffect } from 'react';
import { Wand2, Copy, RefreshCw, User, Target, AlertCircle, Sparkles } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  status: string;
}

export default function TextHumanizer() {
  const [inputText, setInputText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [tone, setTone] = useState('');
  const [audience, setAudience] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([]);
  const [usePersona, setUsePersona] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available personas
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await fetch('/api/personas');
        if (response.ok) {
          const data = await response.json();
          const readyPersonas = (data.personas || []).filter((p: Persona) => p.status === 'ready');
          setAvailablePersonas(readyPersonas);
        }
      } catch (err) {
        console.error('Error fetching personas:', err);
      }
    };

    fetchPersonas();
  }, []);

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to humanize');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = usePersona && selectedPersona ? '/api/humanize-with-persona' : '/api/humanize-text';
      
      const requestBody = {
        text: inputText,
        tone: tone || undefined,
        audience: audience || undefined,
        ...(usePersona && selectedPersona && {
          personaId: selectedPersona,
          enhanceWithPersona: true
        })
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setHumanizedText(data.humanizedText);
      } else {
        setError(data.error || 'Failed to humanize text');
      }
    } catch (err) {
      setError('An error occurred while humanizing the text');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const clearAll = () => {
    setInputText('');
    setHumanizedText('');
    setTone('');
    setAudience('');
    setSelectedPersona('');
    setUsePersona(false);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <Wand2 className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Text Humanizer</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Transform AI-generated text into natural, engaging, and human-like content. 
          Remove robotic patterns and inject personality into your writing.
        </p>
      </div>

      {/* Configuration Options */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Humanization Settings</h3>
        
        {/* Persona Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={usePersona}
              onChange={(e) => setUsePersona(e.target.checked)}
              className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              <Sparkles className="inline h-4 w-4 mr-1 text-purple-600" />
              Use AI Persona for Enhanced Humanization
            </span>
          </label>
          {usePersona && (
            <p className="text-xs text-gray-600 mt-1 ml-6">
              This will humanize the text to match a specific persona&apos;s writing style
            </p>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-4 ${usePersona ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {usePersona && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                AI Persona
              </label>
              <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!usePersona}
                title="Select an AI persona for style matching"
              >
                <option value="">Select a persona...</option>
                {availablePersonas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
              {availablePersonas.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No personas available. Create one first!
                </p>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Tone (Optional)
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select the desired tone for the humanized text"
            >
              <option value="">Auto-detect</option>
              <option value="casual and friendly">Casual & Friendly</option>
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="witty and engaging">Witty & Engaging</option>
              <option value="authoritative">Authoritative</option>
              <option value="passionate">Passionate</option>
              <option value="skeptical">Skeptical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="inline h-4 w-4 mr-1" />
              Audience (Optional)
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select the target audience for the humanized text"
            >
              <option value="">General audience</option>
              <option value="high school students">High School Students</option>
              <option value="college students">College Students</option>
              <option value="professionals">Professionals</option>
              <option value="academics">Academics</option>
              <option value="general public">General Public</option>
              <option value="technical experts">Technical Experts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">AI-Generated Text</h2>
            <span className="text-sm text-gray-500">
              {inputText.length} characters
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your AI-generated text here to make it sound more human and natural..."
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleHumanize}
              disabled={isLoading || !inputText.trim() || (usePersona && !selectedPersona)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {usePersona ? 'Persona Humanizing...' : 'Humanizing...'}
                </>
              ) : (
                <>
                  {usePersona ? <Sparkles className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
                  {usePersona ? 'Humanize with Persona' : 'Humanize Text'}
                </>
              )}
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Humanized Text</h2>
            {humanizedText && (
              <button
                onClick={() => copyToClipboard(humanizedText)}
                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            )}
          </div>
          <div className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto">
            {humanizedText ? (
              <div className="whitespace-pre-wrap text-gray-900">
                {humanizedText}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Your humanized text will appear here...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How The Humanizer Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <div className="font-medium">🎵 Rhythm & Flow</div>
            <div>Varies sentence structure and creates natural cadence with mixed lengths</div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">🎭 Personality</div>
            <div>Injects tone, voice, and character appropriate to your audience</div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">💬 Natural Language</div>
            <div>Uses contractions, colloquialisms, and conversational patterns</div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">⚡ Active Voice</div>
            <div>Converts passive constructions to direct, engaging language</div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">✨ Imperfections</div>
            <div>Adds natural human quirks and removes robotic perfection</div>
          </div>
          <div className="space-y-2">
            <div className="font-medium">🎯 Conciseness</div>
            <div>Cuts fluff and unnecessary formal transitions</div>
          </div>
        </div>
        
        {usePersona && (
          <div className="mt-4 p-4 bg-purple-100 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center gap-2 text-purple-900 font-medium mb-2">
              <Sparkles className="h-5 w-5" />
              Enhanced with AI Persona
            </div>
            <p className="text-purple-800 text-sm">
              When using a persona, the humanizer will match the specific writing style, quirks, 
              and voice patterns of that AI persona, creating text that feels like it was 
              written by that particular personality.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
