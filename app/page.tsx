'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    mainCharacterName: '',
    relationship: '',
    birthYear: ''
  });

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            mainCharacterName: formData.mainCharacterName,
            relationship: formData.relationship,
            birthYear: formData.birthYear ? parseInt(formData.birthYear) : undefined
          }
        })
      });

      const { story } = await response.json();
      
      // Redirect to interview page
      router.push(`/create/interview?storyId=${story.id}`);
    } catch (error) {
      console.error('Failed to create story:', error);
      alert('Failed to create story. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">MainCharacter</h1>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Every Life Has a Story Worth Telling
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Capture the extraordinary journey of ordinary lives. Through AI-powered interviews,
            we help you preserve memories, overcome challenges, and inspire others.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Interview</h3>
            <p className="text-gray-600 text-sm">
              Conversational AI asks thoughtful questions about life's most meaningful moments
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Life Curve</h3>
            <p className="text-gray-600 text-sm">
              Visualize the emotional journey through highs and lows over time
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Beautiful Story</h3>
            <p className="text-gray-600 text-sm">
              AI transforms interviews into compelling narratives to share and cherish
            </p>
          </div>
        </div>

        {/* Create Story Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Start a New Life Story
          </h3>
          
          <form onSubmit={handleCreateStory} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Who's story are we capturing? *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.mainCharacterName}
                onChange={(e) => setFormData({ ...formData, mainCharacterName: e.target.value })}
                placeholder="e.g., Kim Soon-ja"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                Your relationship to them
              </label>
              <input
                id="relationship"
                type="text"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="e.g., Grandmother, Friend, Myself"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-2">
                Birth year (optional)
              </label>
              <input
                id="birthYear"
                type="number"
                value={formData.birthYear}
                onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                placeholder="e.g., 1940"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Begin Interview →'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Takes about 30-45 minutes to complete
          </p>
        </div>

        {/* Story Example */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Inspired by real stories like...</p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg max-w-2xl mx-auto">
            <p className="text-gray-700 italic">
              "Born during the Japanese colonial period, survived the Korean War at age 9,
              raised three children through economic hardships, and found joy in simple moments..."
            </p>
            <p className="text-sm text-gray-600 mt-2">— A grandmother's story</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>Built with 💙 to preserve the stories that matter</p>
      </footer>
    </div>
  );
}
