'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Send, Loader2, MessageSquare, Languages, Upload, Settings } from 'lucide-react';
import WritingStyleUpload from '@/components/WritingStyleUpload';
import AdvancedFeatures from '@/components/AdvancedFeatures';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useWritingStyle, setUseWritingStyle] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateText = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          language: language || 'English',
          useWritingStyle 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate text');
      }

      setResponse(data.response);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'An error occurred while generating text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancedFeature = async (feature: string, data: Record<string, unknown>) => {
    setIsLoading(true);
    setError('');

    try {
      let endpoint = '';
      let requestData = data;

      switch (feature) {
        case 'cultural':
          endpoint = '/api/generate-cultural';
          requestData = { ...data, prompt };
          break;
        case 'strategy':
          endpoint = '/api/content-strategy';
          break;
        case 'multimodal':
          endpoint = '/api/generate-image';
          requestData = { text: response || prompt, imageStyle: 'professional', contentType: 'general' };
          break;
        case 'analytics':
          endpoint = '/api/performance-analytics';
          break;
        default:
          throw new Error('Unknown feature');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to process advanced feature');
      }

      // Handle different response types
      if (feature === 'cultural') {
        setResponse(result.response);
      } else if (feature === 'multimodal' && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
      } else if (feature === 'strategy') {
        setResponse(JSON.stringify(result, null, 2));
      }

    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'An error occurred with the advanced feature');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateText();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Image 
              src="/kalam-ai-logo.svg"
              alt="Kalam AI Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
              Kalam AI
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Enter a prompt in your native language and get AI-generated content in your writing style
          </p>
          <div className="mt-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Your Writing Style
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Your Prompt
              </h2>
              
              {/* Language Input */}
              <div className="mb-4">
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language (optional)
                </label>
                <input
                  id="language"
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  placeholder="e.g., English, Spanish, French, Arabic..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Prompt Input */}
              <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your prompt or topic
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your prompt here... (e.g., 'Write an article about renewable energy', 'Explain quantum computing in simple terms')"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Writing Style Toggle */}
              <div className="mb-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={useWritingStyle}
                    onChange={(e) => setUseWritingStyle(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Use My Writing Style
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-7">
                  Generate content that matches your personal writing style
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateText}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Generate Text
                  </>
                )}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-h-[400px]">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Generated Response
              </h2>
              
              {response ? (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {response}
                  </div>
                  {generatedImage && (
                    <div className="mt-4">
                      <Image 
                        src={generatedImage} 
                        alt="Generated content visualization" 
                        width={1024}
                        height={1024}
                        className="w-full rounded-lg" 
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated content will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Advanced Features Section */}
        <div className="mt-8">
          <AdvancedFeatures onFeatureSelect={handleAdvancedFeature} />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            Powered by Google Gemini AI • Built with Next.js and Tailwind CSS
          </p>
        </div>
      </div>

      {/* Writing Style Upload Modal */}
      {showUploadModal && (
        <WritingStyleUpload
          onClose={() => setShowUploadModal(false)}
          onSave={() => {
            // Optionally refresh writing styles or show success message
          }}
        />
      )}
    </div>
  );
}
