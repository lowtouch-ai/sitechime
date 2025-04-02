import React, { useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  // Add a class to the body to prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Function to handle image download
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a link element
    const link = document.createElement('a');
    link.href = imageUrl;
    
    // Extract filename from URL or use a default name
    const filename = imageUrl.split('/').pop() || 'downloaded-image.png';
    link.download = filename;
    
    // Append to the document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Use a portal to render the modal directly in the document body
  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 999999 // Extremely high z-index to ensure it's above everything
      }}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 flex space-x-2 z-20">
          <button 
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-colors"
            onClick={handleDownload}
            aria-label="Download image"
            title="Download image"
          >
            <ArrowDownTrayIcon className="h-6 w-6" />
          </button>
          <button 
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-200 transition-colors"
            onClick={onClose}
            aria-label="Close enlarged image"
            title="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="max-w-[90%] max-h-[90%]">
          <Zoom>
            <img 
              src={imageUrl} 
              alt="Enlarged view" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              style={{ margin: '0 auto' }}
            />
          </Zoom>
        </div>
      </div>
    </div>,
    document.body
  );
};