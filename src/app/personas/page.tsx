'use client';

import { useState, useEffect } from 'react';
import { Plus, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Persona {
  _id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  updatedAt: string;
  originalTexts?: Array<{ title: string; content: string }>;
  linguisticFingerprint?: Record<string, unknown>;
}

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await fetch('/api/personas');
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas || []);
      } else {
        setError('Failed to fetch personas');
      }
    } catch (err) {
      setError('Error fetching personas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading personas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Personas</h1>
            <p className="text-gray-600">
              Manage your AI writing personas for style emulation and enhanced text generation.
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Persona
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {personas.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No personas yet</h3>
            <p className="text-gray-600 mb-4">Create your first AI persona to get started with style emulation.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Create Your First Persona
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {personas.map((persona) => (
              <div key={persona._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{persona.name}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(persona.status)}
                    <span className="text-sm text-gray-600">{getStatusText(persona.status)}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Created: {new Date(persona.createdAt).toLocaleDateString()}</p>
                  <p>Updated: {new Date(persona.updatedAt).toLocaleDateString()}</p>
                  {persona.originalTexts && (
                    <p>Source texts: {persona.originalTexts.length}</p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200">
                    View Details
                  </button>
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                    Use Persona
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
