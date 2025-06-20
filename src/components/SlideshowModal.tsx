
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageData } from '@/types/image';

interface SlideshowModalProps {
  images: ImageData[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const SlideshowModal: React.FC<SlideshowModalProps> = ({ images, currentIndex, isOpen, onClose }) => {
  const [index, setIndex] = useState(currentIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && images.length > 1) {
      interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  const goToPrevious = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
    if (e.key === ' ') {
      e.preventDefault();
      togglePlayPause();
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[index];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Header controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="text-white">
          <h3 className="text-xl font-semibold">{currentImage.name}</h3>
          <p className="text-sm text-gray-300">
            {index + 1} / {images.length}
          </p>
        </div>
        
        <div className="flex gap-2">
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="lg"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 rounded-full"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      {/* Main image */}
      <div className="max-w-[90vw] max-h-[80vh] flex items-center justify-center">
        <img
          src={currentImage.url}
          alt={currentImage.name}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 right-4">
        {currentImage.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {currentImage.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-2 max-w-md overflow-x-auto p-2">
            {images.map((img, imgIndex) => (
              <button
                key={img.id}
                onClick={() => setIndex(imgIndex)}
                className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  imgIndex === index 
                    ? 'border-white shadow-lg' 
                    : 'border-transparent opacity-60 hover:opacity-80'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideshowModal;
