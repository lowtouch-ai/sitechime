import React from 'react';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useChatContext } from './ChatContext';

export const ChatHeader: React.FC = () => {
  const { 
    botName,
    botAvatarUrl,
    botAvatarDimensions,
    isExpanded, 
    setIsExpanded,
    setIsOpen,
    clearMessages,
    theme,
    config
  } = useChatContext();
  
  const handleClose = () => {
    setIsOpen(false);
    // Reset expanded state when closing
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const showFullscreen = config?.widget.behavior.allowFullscreen !== false;
  
  return (
    <div className="flex items-center justify-between p-4 border-b shadow-sm" style={{ 
      borderColor: theme.border,
      backgroundColor: theme.surface 
    }}>
      <div className="flex items-center space-x-3">
        {botAvatarUrl ? (
          <div className="relative">
            <img 
              src={botAvatarUrl}
              alt={botName}
              style={{ 
                width: botAvatarDimensions?.width ? `${botAvatarDimensions.width}px` : '40px', 
                height: botAvatarDimensions?.height ? `${botAvatarDimensions.height}px` : '40px',
                borderColor: theme.primary 
              }}
              className="rounded-full object-cover border-2 shadow-sm"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        ) : (
          <div 
            style={{ 
              backgroundColor: theme.primary, 
              color: theme.secondary,
              width: botAvatarDimensions?.width ? `${botAvatarDimensions.width}px` : '40px', 
              height: botAvatarDimensions?.height ? `${botAvatarDimensions.height}px` : '40px' 
            }}
            className="rounded-full flex items-center justify-center text-xl font-bold shadow-sm"
          >
            {botName.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-sm leading-tight" style={{ color: theme.text }}>{botName}</h3>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-xs opacity-60" style={{ color: theme.text }}>Online</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        {showFullscreen && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? 
              <ArrowsPointingInIcon className="w-5 h-5" style={{ color: theme.icons.neutral }} /> : 
              <ArrowsPointingOutIcon className="w-5 h-5" style={{ color: theme.icons.neutral }} />
            }
          </button>
        )}
        <button 
          onClick={clearMessages}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Clear chat"
        >
          <TrashIcon className="w-5 h-5" style={{ color: theme.icons.destructive }} />
        </button>
        <button 
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close chat"
        >
          <XMarkIcon className="w-5 h-5" style={{ color: theme.icons.destructive }} />
        </button>
      </div>
    </div>
  );
};