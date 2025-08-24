'use client';

import React, { useState } from 'react';

interface DemoPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  expectedFeatures: string[];
  category: 'academic' | 'business' | 'cultural' | 'technical';
}

const demoPrompts: DemoPrompt[] = [
  {
    id: 'human-writer',
    title: 'Human Writer Style',
    description: 'Authentically human writing that\'s indistinguishable from content written by skilled human writers',
    prompt: `You are Kalam AI using the advanced Human Writer style. Write authentically human content that feels natural, engaging, and conversational.

Task: Write a 300-word piece about the psychology of procrastination. Use natural rhythm, contractions, rhetorical questions, analogies, and genuine personality. Avoid robotic AI phrases. Make it feel like a thoughtful friend explaining this topic.`,
    expectedFeatures: ['Natural contractions', 'Varied sentence rhythm', 'Rhetorical questions', 'Analogies & metaphors', 'Authentic personality', 'Show don\'t tell'],
    category: 'business'
  },
  {
    id: 'amartya-sen',
    title: 'Amartya Sen Academic Style',
    description: 'Generate content using Nobel laureate economist\'s writing style',
    prompt: `You are Kalam AI with an 'Amartya Sen Style Persona' based on analyzing his economic writings. His style features dense, analytical prose with philosophical depth and complex sentence structures.

Task: Write a 300-word analysis on "The Impact of AI on Rural Employment in India" using his characteristic ethical considerations and policy recommendations.`,
    expectedFeatures: ['Complex sentences', 'Ethical framework', 'Policy suggestions', 'Analytical depth'],
    category: 'academic'
  },
  {
    id: 'startup-voice',
    title: 'Tech Startup Brand Voice',
    description: 'Energetic, buzzword-rich content typical of tech startups',
    prompt: `You are Kalam AI with a 'TechCrunch Startup Voice Persona' featuring energetic, confident tone with buzzwords like "disruptive," "scalable," "game-changing."

Task: Write a 200-word LinkedIn post announcing Kalam AI's new Style Persona feature for content teams.`,
    expectedFeatures: ['Startup buzzwords', 'Confident tone', 'Growth metrics', 'Call-to-action'],
    category: 'business'
  },
  {
    id: 'hinglish-cultural',
    title: 'Hinglish Cultural Adaptation',
    description: 'Natural code-switching for Indian audiences',
    prompt: `You are Kalam AI with cultural adaptation for urban Indian millennials. Write a 200-word social media post about digital payments using natural Hinglish style with cultural references.`,
    expectedFeatures: ['Code-switching', 'Cultural references', 'Mobile-first', 'Relatable tone'],
    category: 'cultural'
  },
  {
    id: 'academic-bridge',
    title: 'Academic-to-Patient Translation',
    description: 'Transform complex research into accessible language',
    prompt: `Transform this medical research into patient-friendly language:

"The longitudinal cohort study (n=2,847) demonstrated statistically significant improvements in glycemic control (HbA1c reduction: 1.3% ± 0.4, p<0.001) following implementation of continuous glucose monitoring protocols."

Make it understandable while maintaining accuracy.`,
    expectedFeatures: ['Simple language', 'Preserved accuracy', 'Patient-friendly', 'Clear benefits'],
    category: 'technical'
  }
];

export default function CapabilitiesDemo() {
  const [selectedPrompt, setSelectedPrompt] = useState<DemoPrompt | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt: DemoPrompt) => {
    setIsGenerating(true);
    setSelectedPrompt(prompt);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.prompt,
          language: 'English',
          useWritingStyle: false
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setGeneratedContent(data.generatedText);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Error generating content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      academic: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      cultural: 'bg-purple-100 text-purple-800',
      technical: 'bg-orange-100 text-orange-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Kalam AI Capabilities Demo
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the unique features that set Kalam AI apart from generic AI tools. 
          Our Style Persona system learns from academic papers and adapts to specific writing styles.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Demo Prompts */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Choose a Demo Scenario
          </h2>
          
          {demoPrompts.map((prompt) => (
            <div key={prompt.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{prompt.title}</h3>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getCategoryColor(prompt.category)}`}>
                    {prompt.category}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{prompt.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Expected Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {prompt.expectedFeatures.map((feature, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleGenerate(prompt)}
                    disabled={isGenerating}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGenerating && selectedPrompt?.id === prompt.id 
                      ? 'Generating...' 
                      : 'Generate with Kalam AI'
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Results Panel */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-white rounded-lg border shadow-sm h-fit">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Generated Content</h3>
              {selectedPrompt && (
                <p className="text-sm text-gray-600 mt-1">
                  Generated using: <strong>{selectedPrompt.title}</strong>
                </p>
              )}
            </div>
            <div className="p-6">
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                      {generatedContent}
                    </pre>
                  </div>
                  
                  {selectedPrompt && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        Style Features Demonstrated:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedPrompt.expectedFeatures.map((feature, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded border">
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🤖</div>
                  <p>Select a demo scenario to see Kalam AI in action</p>
                  <p className="text-sm mt-2">
                    Each demo showcases different style adaptation capabilities
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          What Makes Kalam AI Unique
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold mb-2">Academic Style Learning</h3>
            <p className="text-sm text-gray-600">
              Analyzes research papers to create Style Personas that replicate scholarly writing patterns
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-3">🌍</div>
            <h3 className="font-semibold mb-2">Cultural Adaptation</h3>
            <p className="text-sm text-gray-600">
              Natural Hinglish and regional language support for authentic cultural communication
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl mb-3">🔄</div>
            <h3 className="font-semibold mb-2">Academic-to-Practical Bridge</h3>
            <p className="text-sm text-gray-600">
              Transforms complex academic content into accessible language while preserving accuracy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
