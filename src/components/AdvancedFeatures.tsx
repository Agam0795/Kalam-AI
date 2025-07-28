'use client';

import { useState } from 'react';
import { 
  ImageIcon, 
  Globe, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Target,
  Sparkles,
  Brain
} from 'lucide-react';

interface AdvancedFeaturesProps {
  onFeatureSelect: (feature: string, data: Record<string, unknown>) => void;
}

export default function AdvancedFeatures({ onFeatureSelect }: AdvancedFeaturesProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [culturalSettings, setCulturalSettings] = useState({
    region: 'India',
    language: 'Hinglish',
    culturalStyle: 'Friendly and relatable',
    targetAudience: 'Urban Millennials',
    useLocalReferences: true
  });

  const [contentGoal, setContentGoal] = useState({
    frequency: 'twice a week',
    platform: 'blog',
    niche: 'AI and Technology',
    targetAudience: 'Tech enthusiasts',
    contentType: 'articles'
  });

  const features = [
    {
      id: 'multimodal',
      title: 'Multimodal Content',
      description: 'Generate images, audio, and visualizations alongside text',
      icon: <ImageIcon className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'cultural',
      title: 'Cultural Adaptation',
      description: 'Hinglish and regional language support with cultural context',
      icon: <Globe className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'strategy',
      title: 'Content Strategy Agent',
      description: 'Autonomous content planning and trend research',
      icon: <Brain className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'analytics',
      title: 'Performance Analytics',
      description: 'Track performance and optimize content based on data',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'calendar',
      title: 'Content Calendar',
      description: 'Automated content planning and scheduling',
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 'optimization',
      title: 'AI Optimization',
      description: 'Predictive engagement scoring and content improvement',
      icon: <Target className="h-6 w-6" />,
      color: 'bg-red-100 text-red-600'
    }
  ];

  const handleFeatureClick = (featureId: string) => {
    setSelectedFeature(featureId);
  };

  const handleCulturalGenerate = () => {
    onFeatureSelect('cultural', {
      culturalContext: culturalSettings,
      useHinglish: culturalSettings.language === 'Hinglish'
    });
  };

  const handleStrategyAction = (action: string) => {
    onFeatureSelect('strategy', {
      action,
      contentGoal
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Advanced AI Features
        </h2>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => handleFeatureClick(feature.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              selectedFeature === feature.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
            }`}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${feature.color}`}>
              {feature.icon}
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          </button>
        ))}
      </div>

      {/* Feature-specific Controls */}
      {selectedFeature && (
        <div className="border-t pt-6 mt-6">
          {selectedFeature === 'cultural' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">Cultural Context Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Region
                  </label>
                  <select
                    value={culturalSettings.region}
                    onChange={(e) => setCulturalSettings({...culturalSettings, region: e.target.value})}
                    aria-label="Select region"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="India">India</option>
                    <option value="North India">North India</option>
                    <option value="South India">South India</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Bengal">Bengal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language Style
                  </label>
                  <select
                    value={culturalSettings.language}
                    onChange={(e) => setCulturalSettings({...culturalSettings, language: e.target.value})}
                    aria-label="Select language style"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Hinglish">Hinglish (Hindi + English)</option>
                    <option value="Tamil-English">Tamil-English</option>
                    <option value="Bengali-English">Bengali-English</option>
                    <option value="Marathi-English">Marathi-English</option>
                    <option value="Pure English">Pure English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={culturalSettings.targetAudience}
                    onChange={(e) => setCulturalSettings({...culturalSettings, targetAudience: e.target.value})}
                    placeholder="e.g., Urban Millennials, College Students"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cultural Style
                  </label>
                  <select
                    value={culturalSettings.culturalStyle}
                    onChange={(e) => setCulturalSettings({...culturalSettings, culturalStyle: e.target.value})}
                    aria-label="Select cultural style"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Friendly and relatable">Friendly and relatable</option>
                    <option value="Professional">Professional</option>
                    <option value="Casual and humorous">Casual and humorous</option>
                    <option value="Formal and respectful">Formal and respectful</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="localReferences"
                  checked={culturalSettings.useLocalReferences}
                  onChange={(e) => setCulturalSettings({...culturalSettings, useLocalReferences: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="localReferences" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include local references (festivals, culture, celebrities)
                </label>
              </div>

              <button
                onClick={handleCulturalGenerate}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Generate Cultural Content
              </button>
            </div>
          )}

          {selectedFeature === 'strategy' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">Content Strategy Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Publishing Frequency
                  </label>
                  <input
                    type="text"
                    value={contentGoal.frequency}
                    onChange={(e) => setContentGoal({...contentGoal, frequency: e.target.value})}
                    placeholder="e.g., twice a week, daily"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform
                  </label>
                  <select
                    value={contentGoal.platform}
                    onChange={(e) => setContentGoal({...contentGoal, platform: e.target.value})}
                    aria-label="Select platform"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="blog">Blog</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="medium">Medium</option>
                    <option value="newsletter">Newsletter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Niche
                  </label>
                  <input
                    type="text"
                    value={contentGoal.niche}
                    onChange={(e) => setContentGoal({...contentGoal, niche: e.target.value})}
                    placeholder="e.g., AI trends, startup advice"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentGoal.contentType}
                    onChange={(e) => setContentGoal({...contentGoal, contentType: e.target.value})}
                    aria-label="Select content type"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="articles">Articles</option>
                    <option value="posts">Social Posts</option>
                    <option value="newsletters">Newsletters</option>
                    <option value="tutorials">Tutorials</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleStrategyAction('research_trending')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Research Trending Topics
                </button>

                <button
                  onClick={() => handleStrategyAction('create_content_calendar')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Create Content Calendar
                </button>
              </div>
            </div>
          )}

          {selectedFeature === 'multimodal' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">Multimodal Content Generation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This feature will automatically generate images, audio, and data visualizations to complement your text content.
              </p>
              <button
                onClick={() => onFeatureSelect('multimodal', { generateImages: true })}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Enable Multimodal Generation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
