import React, { useState } from 'react';
import { Image, ChevronRight, ChevronLeft, FileText } from 'lucide-react';

const TemplateThumbnail = ({ 
  template, 
  className = "h-48",
  onImageClick 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  
  // Ensure imageUrls exists and handle potential issues
  const images = template.imageUrls || [];
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentImageIndex] : null;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleImageClick = () => {
    if (hasImages && onImageClick) {
      onImageClick();
    }
  };

  const handleImageError = (index) => {
    console.error(`❌ Failed to load image ${index} for template ${template.name}`);
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoad = (index) => {
    console.log(`✅ Successfully loaded image ${index} for template ${template.name}`);
    setImageErrors(prev => ({ ...prev, [index]: false }));
  };

  const getImageUrl = (image) => {
    if (!image || !image.url) return null;
    
    // Ensure URL is absolute
    if (image.url.startsWith('http')) {
      return image.url;
    } else {
      // Prepend base URL for relative URLs
      const baseURL = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:5001';
      return `${baseURL}${image.url}`;
    }
  };

  const getBackgroundColor = (ext) => {
    const colorMap = {
      'docx': 'from-blue-50 to-blue-100',
      'doc': 'from-blue-50 to-blue-100',
      'xlsx': 'from-green-50 to-green-100',
      'xls': 'from-green-50 to-green-100',
      'csv': 'from-green-50 to-green-100',
      'pdf': 'from-red-50 to-red-100',
      'pptx': 'from-orange-50 to-orange-100',
      'ppt': 'from-orange-50 to-orange-100',
      'txt': 'from-gray-50 to-gray-100',
      'rtf': 'from-gray-50 to-gray-100',
    };
    return colorMap[ext] || 'from-gray-50 to-gray-100';
  };

  const currentImageUrl = currentImage ? getImageUrl(currentImage) : null;
  const hasCurrentImageError = imageErrors[currentImageIndex];

  return (
    <div 
      className={`${className} bg-gradient-to-br ${getBackgroundColor(template.fileExtension)} relative overflow-hidden group cursor-pointer`}
      onClick={handleImageClick}
    >
      {hasImages && currentImageUrl && !hasCurrentImageError ? (
        <>
          {/* Main Image */}
          <img
            src={currentImageUrl}
            alt={currentImage.alt || `Preview for ${template.name}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => handleImageError(currentImageIndex)}
            onLoad={() => handleImageLoad(currentImageIndex)}
          />
          
          {/* Navigation Arrows for multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Overlay with view text */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-white text-center">
              <Image className="w-8 h-8 mx-auto mb-1" />
              <span className="text-sm font-medium">View Images</span>
            </div>
          </div>
        </>
      ) : (
        /* Fallback when no images or image failed to load */
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <span className="text-gray-500 text-sm">
              {hasCurrentImageError ? 'Failed to load image' : 'No Preview'}
            </span>
            {hasCurrentImageError && (
              <p className="text-xs text-gray-400 mt-1">Click to try in carousel</p>
            )}
          </div>
        </div>
      )}

      {/* File Extension Badge */}
      <div className="absolute bottom-2 left-2">
        <span className="px-2 py-1 bg-white bg-opacity-90 rounded text-xs font-medium text-gray-700">
          .{template.fileExtension}
        </span>
      </div>
    </div>
  );
};

export default TemplateThumbnail;