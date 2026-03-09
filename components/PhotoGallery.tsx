'use client';

import { useState } from 'react';
import { Photo } from '@/types';

interface PhotoGalleryProps {
  photos: Photo[];
  onDelete?: (photoId: string) => void;
  editable?: boolean;
}

export default function PhotoGallery({ photos, onDelete, editable = false }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (photos.length === 0) {
    return null;
  }

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/photos?photoId=${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      onDelete?.(photoId);
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete photo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="relative group cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={photo.display_url || ''}
                alt={photo.character_name || 'Photo'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            
            {/* Overlay with info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-3">
              {photo.approximate_age && (
                <p className="text-white text-sm font-medium">
                  Age {photo.approximate_age}
                </p>
              )}
              {photo.character_name && (
                <p className="text-white text-xs opacity-90">
                  {photo.character_name}
                </p>
              )}
            </div>

            {/* AI Generated Badge */}
            {photo.is_ai_generated && (
              <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                AI
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <img
              src={selectedPhoto.display_url || ''}
              alt={selectedPhoto.character_name || 'Photo'}
              className="w-full h-auto max-h-[70vh] object-contain"
            />

            {/* Info */}
            <div className="p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  {selectedPhoto.character_name && (
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedPhoto.character_name}
                    </h3>
                  )}
                  {selectedPhoto.approximate_age && (
                    <p className="text-gray-600">Age {selectedPhoto.approximate_age}</p>
                  )}
                  {selectedPhoto.is_ai_generated && (
                    <p className="text-sm text-purple-600 mt-2">
                      AI Generated
                    </p>
                  )}
                </div>

                {editable && onDelete && (
                  <button
                    onClick={() => handleDelete(selectedPhoto.id)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
