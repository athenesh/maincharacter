'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import LifeCurve from '@/components/LifeCurve';
import PhotoUpload from '@/components/PhotoUpload';
import PhotoGallery from '@/components/PhotoGallery';
import { Story, StoryChapter, LifeEvent, Photo } from '@/types';

function StoryContent() {
  const params = useParams();
  const storyId = params.id as string;

  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  const loadStory = async () => {
    try {
      const response = await fetch(`/api/story?id=${storyId}`);
      const data = await response.json();
      
      setStory(data.story);
      setChapters(data.chapters);
      setEvents(data.events);
      setPhotos(data.photos);
    } catch (error) {
      console.error('Failed to load story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Story link copied to clipboard!');
  };

  const handlePhotoUploadComplete = (photo: Photo) => {
    setPhotos(prev => [...prev, photo]);
    setShowPhotoUpload(false);
  };

  const handlePhotoDelete = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Story not found</h2>
          <p className="text-gray-600">This story may have been deleted or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  const birthYear = story.birth_year;
  const currentYear = new Date().getFullYear();
  const approximateAge = birthYear ? currentYear - birthYear : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{story.story_title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {birthYear && `Born ${birthYear}`}
              {approximateAge && ` · ${approximateAge} years old`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPhotoUpload(!showPhotoUpload)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              {showPhotoUpload ? 'Hide Upload' : '+ Add Photos'}
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Share Story
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Photo Upload Form */}
        {showPhotoUpload && (
          <section className="mb-12">
            <PhotoUpload 
              storyId={storyId}
              characterName={story.main_character_name}
              onUploadComplete={handlePhotoUploadComplete}
            />
          </section>
        )}

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
            <PhotoGallery 
              photos={photos} 
              onDelete={handlePhotoDelete}
              editable={true}
            />
          </section>
        )}

        {/* Life Curve */}
        {events.length > 0 && (
          <section className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <LifeCurve events={events} characterName={story.main_character_name} />
          </section>
        )}

        {/* Story Chapters */}
        <div className="space-y-12">
          {chapters.map((chapter, index) => (
            <section key={chapter.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Chapter Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-6 text-white">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl font-bold opacity-50">
                    {String(chapter.chapter_number).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold">{chapter.chapter_title}</h2>
                    {chapter.age_range && (
                      <p className="text-sm opacity-90 mt-1">Age {chapter.age_range}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chapter Content */}
              <div className="px-8 py-8">
                <div className="prose prose-lg max-w-none">
                  {chapter.content?.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Related Events */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Key Moments
                  </h3>
                  <div className="space-y-3">
                    {events
                      .filter(e => e.life_period === chapter.life_period)
                      .map(event => (
                        <div key={event.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              {event.emotional_rating}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{event.event_title}</p>
                            {event.age && (
                              <p className="text-sm text-gray-500">Age {event.age}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Every life has a story worth telling
            </h3>
            <p className="text-gray-600 mb-6">
              Create your own life story or help preserve the memories of someone you love.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Start a New Story
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm mt-16">
        <p>Created with MainCharacter · Preserving life stories with AI</p>
      </footer>
    </div>
  );
}

export default function StoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    }>
      <StoryContent />
    </Suspense>
  );
}
