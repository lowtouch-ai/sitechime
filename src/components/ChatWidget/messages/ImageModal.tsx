import React from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[10000]"
      onClick={onClose}
      style={{ 
        width: '100vw', 
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0
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
    </div>
  );
};