import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const handleContainerClick = () => {
    onClose();
  };

  const handleImageContainerClick = (e: React.MouseEvent) => {
    // Prevent clicks on the image container from bubbling up to the overlay
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000] p-4"
      onClick={handleContainerClick}
    >
      <div 
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={handleImageContainerClick}
      >
        <button 
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
          onClick={onClose}
          aria-label="Close enlarged image"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <img 
          src={imageUrl} 
          alt="Enlarged view" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
};