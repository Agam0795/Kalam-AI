'use client';

import { useState } from 'react';

export default function HumanizerDebug() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health-check');
      const data = await response.json();
      setResult(`Health Check: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Health Check Error: ${error}`);
    }
    setLoading(false);
  };

  const testGoogleAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-humanize');
      const data = await response.json();
      setResult(`Google API Test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Google API Test Error: ${error}`);
    }
    setLoading(false);
  };

  const testHumanizer = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/humanize-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: 'This is a test text that needs to be humanized.',
          tone: 'conversational',
          audience: 'general'
        }),
      });
      const data = await response.json();
      setResult(`Humanizer Test: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Humanizer Test Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Humanizer API Debug</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testHealthCheck}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Health Check
        </button>
        
        <button
          onClick={testGoogleAPI}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          Test Google API
        </button>
        
        <button
          onClick={testHumanizer}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 ml-2"
        >
          Test Humanizer
        </button>
      </div>

      {loading && <p className="text-blue-600">Testing...</p>}
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Results:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {result || 'No tests run yet'}
        </pre>
      </div>
    </div>
  );
}
