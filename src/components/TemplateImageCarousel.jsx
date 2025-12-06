import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const TemplateImageCarousel = ({ 
  images, 
  isOpen, 
  onClose, 
  templateName,
  onDownload 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const { toast } = useToast();

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') onClose();
  };

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setImageLoadErrors({});
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const handleDownload = async () => {
    if (onDownload) {
      try {
        await onDownload(images[currentIndex]);
        toast({
          title: "Download Started",
          description: "Image download started successfully",
        });
      } catch (error) {
        toast({
          title: "Download Failed",
          description: "Failed to download image",
          variant: "destructive",
        });
      }
    }
  };

  const handleImageError = (index) => {
    console.error(`❌ Failed to load image ${index}:`, images[index]?.url);
    setImageLoadErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoad = (index) => {
    console.log(`✅ Successfully loaded image ${index}:`, images[index]?.url);
    setImageLoadErrors(prev => ({ ...prev, [index]: false }));
  };
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Ensure URLs are absolute
  const getImageUrl = (image) => {
    if (!image || !image.url) return null;
    
    if (image.url.startsWith('http')) {
      return image.url;
    } else {
      const baseURL = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : `${API_BASE_URL}`;
      return `${baseURL}${image.url}`;
    }
  };

  // Early return AFTER all hooks
  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const currentImageUrl = getImageUrl(currentImage);
  const hasLoadError = imageLoadErrors[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl max-h-full w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
  <div className="flex items-center gap-4">
    <Button
      variant="ghost"
      size="icon"
      onClick={onClose}
      className="text-white hover:bg-white/20"
    >
      <X className="w-5 h-5" />
    </Button>
  </div>
  
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      className="text-black border-white hover:bg-white hover:text-black"
      disabled={hasLoadError}
    >
      <Download className="w-4 h-4 mr-1" />
      Download
    </Button>
  </div>
</div>

        {/* Main Image */}
        <div className="flex-1 relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="w-full h-full flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              {hasLoadError || !currentImageUrl ? (
                <div className="text-center text-white">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">Failed to load image</p>
                  <p className="text-sm text-gray-300 mt-2">
                    URL: {currentImage?.url}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    The image may not exist or there might be a server issue.
                  </p>
                </div>
              ) : (
                <img
                  src={currentImageUrl}
                  alt={currentImage?.alt || `Preview image ${currentIndex + 1} for ${templateName}`}
                  className="max-w-full max-h-full object-contain"
                  onError={() => handleImageError(currentIndex)}
                  onLoad={() => handleImageLoad(currentIndex)}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="p-4 bg-black bg-opacity-50">
            <div className="flex justify-center gap-2 overflow-x-auto py-2">
              {images.map((image, index) => {
                const thumbnailUrl = getImageUrl(image);
                const hasThumbnailError = imageLoadErrors[index];
                
                return (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden transition-all ${
                      index === currentIndex 
                        ? 'border-blue-500 scale-110' 
                        : hasThumbnailError 
                          ? 'border-red-500' 
                          : 'border-transparent hover:border-white'
                    }`}
                  >
                    {hasThumbnailError || !thumbnailUrl ? (
                      <div className="w-full h-full bg-red-900 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-red-300" />
                      </div>
                    ) : (
                      <img
                        src={thumbnailUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(index)}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateImageCarousel;