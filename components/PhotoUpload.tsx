'use client';

import { useState, useRef } from 'react';
import { Photo } from '@/types';

interface PhotoUploadProps {
  storyId: string;
  characterName: string;
  onUploadComplete?: (photo: Photo) => void;
}

export default function PhotoUpload({ storyId, characterName, onUploadComplete }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isMainCharacter, setIsMainCharacter] = useState(true);
  const [approximateAge, setApproximateAge] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadError(null);
    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storyId', storyId);
      formData.append('isMainCharacter', String(isMainCharacter));
      formData.append('characterName', characterName);
      if (approximateAge) {
        formData.append('approximateAge', approximateAge);
      }

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { photo } = await response.json();

      // Reset form
      setFile(null);
      setPreview(null);
      setApproximateAge('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent
      onUploadComplete?.(photo);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setApproximateAge('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Photo</h3>
      
      {!preview ? (
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <svg 
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48"
            >
              <path 
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Click to select a photo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          {/* Photo Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isMainCharacter"
                checked={isMainCharacter}
                onChange={(e) => setIsMainCharacter(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isMainCharacter" className="text-sm text-gray-700">
                This is {characterName}
              </label>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age in photo (optional)
              </label>
              <input
                type="number"
                id="age"
                value={approximateAge}
                onChange={(e) => setApproximateAge(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {uploadError}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Photo'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
