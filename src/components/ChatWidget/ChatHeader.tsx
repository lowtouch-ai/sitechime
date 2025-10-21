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
    isExpanded, 
    setIsExpanded,
    setIsOpen,
    clearMessages,
    theme
  } = useChatContext();
  
  const handleClose = () => {
    setIsOpen(false);
    // Reset expanded state when closing
    if (isExpanded) {
      setIsExpanded(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.border }}>
      <div className="flex items-center space-x-3">
        {botAvatarUrl ? (
          <img 
            src={botAvatarUrl}
            alt={botName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-semibold"
            style={{ backgroundColor: theme.primary, color: theme.secondary }}
          >
            {botName.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-medium text-sm">{botName}</h3>
          <p className="text-xs opacity-70">AI Assistant</p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
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