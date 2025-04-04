import React, { useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  imageTitle?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({ 
  imageUrl, 
  onClose,
  imageTitle = 'Image'
}) => {
  // Add a class to the body to prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Function to handle image download
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Fetch the image data
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a blob URL for the image data
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Use the image title for the filename, sanitize it and add extension
      const extension = imageUrl.split('.').pop()?.toLowerCase() || 'png';
      const sanitizedTitle = imageTitle
        .replace(/[^a-z0-9\s]/gi, '') // Remove special characters
        .replace(/\s+/g, '_'); // Replace spaces with underscores
      
      const filename = `${sanitizedTitle}.${extension}`;
      link.download = filename;
      
      // Append to the document, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback to the old method if fetch fails
      window.open(imageUrl, '_blank');
    }
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
        className="relative w-full h-full flex flex-col items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 flex space-x-2 z-20">
          <button 
            className="bg-black rounded-full p-2 shadow-md hover:bg-gray-400 transition-colors"
            onClick={handleDownload}
            aria-label="Download image"
            title="Download image"
          >
            <ArrowDownTrayIcon className="h-6 w-6" />
          </button>
          <button 
            className="bg-black rounded-full p-2 shadow-md hover:bg-gray-400 transition-colors"
            onClick={onClose}
            aria-label="Close enlarged image"
            title="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="max-w-[90%] max-h-[90%] flex flex-col items-center">
          <Zoom>
            <img 
              src={imageUrl} 
              alt={imageTitle} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              style={{ margin: '0 auto' }}
            />
          </Zoom>
          
          {imageTitle && (
            <div className="mt-4 bg-white px-4 py-2 rounded-lg shadow-lg text-center max-w-full">
              <h3 className="font-medium text-lg text-gray-800">{imageTitle}</h3>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};