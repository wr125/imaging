'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (promptText: string) => {
    if (!promptText) {
      setGeneratedImages([]);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setGeneratedImages([]); // Clear previous images
      
      const response = await fetch('/api/fal/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate images');
      }

      if (!data.imageUrls || !Array.isArray(data.imageUrls) || data.imageUrls.length === 0) {
        throw new Error('No images were generated');
      }

      setGeneratedImages(data.imageUrls);
    } catch (err) {
      console.error('Error generating images:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setGeneratedImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      generateImage(prompt);
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Image Generator
        </h1>
        <p className="text-gray-600">
          Type your prompt and press Enter to generate four images...
        </p>
      </div>

      <div className="w-full">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the images you want to see..."
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {/* Show placeholders when loading */}
        {isLoading && Array(4).fill(null).map((_, index) => (
          <div 
            key={`placeholder-${index}`}
            className="relative aspect-square w-full rounded-lg overflow-hidden border bg-gray-100"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ))}

        {/* Show generated images */}
        {!isLoading && generatedImages.map((imageUrl, index) => (
          <div 
            key={`image-${index}`}
            className="relative aspect-square w-full rounded-lg overflow-hidden border group"
          >
            <Image
              src={imageUrl}
              alt={`Generated image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={true}
              unoptimized={true}
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 flex items-center justify-center">
              <button
                onClick={() => handleDownload(imageUrl)}
                className="px-4 py-2 bg-white text-black rounded-lg scale-95 hover:scale-100"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 