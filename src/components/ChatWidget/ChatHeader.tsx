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
    <div className="flex items-center justify-between p-3.5 border-b relative z-10" style={{ 
      borderColor: 'rgba(255, 255, 255, 0.2)',
      backgroundColor: `rgba(255, 255, 255, ${theme.glassmorphism.opacity * 0.9})`
    }}>
      <div className="flex items-center space-x-3">
        {botAvatarUrl ? (
          <div className="relative group">
            <img 
              src={botAvatarUrl}
              alt={botName}
              style={{ 
                width: botAvatarDimensions?.width ? `${botAvatarDimensions.width}px` : '38px', 
                height: botAvatarDimensions?.height ? `${botAvatarDimensions.height}px` : '38px',
                borderColor: theme.primary 
              }}
              className="rounded-full object-cover border-2 shadow-md transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
        ) : (
          <div 
            style={{ 
              backgroundColor: theme.primary, 
              color: theme.secondary,
              width: botAvatarDimensions?.width ? `${botAvatarDimensions.width}px` : '38px', 
              height: botAvatarDimensions?.height ? `${botAvatarDimensions.height}px` : '38px' 
            }}
            className="rounded-full flex items-center justify-center text-lg font-bold shadow-md"
          >
            {botName.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-bold text-[15px] tracking-tight leading-tight" style={{ color: theme.text }}>{botName}</h3>
          <div className="flex items-center space-x-1 mt-0.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            <p className="text-[10px] font-medium opacity-70 uppercase tracking-wider" style={{ color: theme.text }}>
              {config?.branding.headerSubtitle || 'Online Now'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-0.5">
        {showFullscreen && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl hover:bg-black/5 active:bg-black/10 transition-all flex items-center justify-center"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? 
              <ArrowsPointingInIcon className="w-5 h-5" style={{ color: theme.text }} /> : 
              <ArrowsPointingOutIcon className="w-5 h-5" style={{ color: theme.text }} />
            }
          </button>
        )}
        {config?.widget.behavior.clearChat?.enabled !== false && (
          <button 
            onClick={clearMessages}
            className="p-2 rounded-xl hover:bg-black/5 active:bg-black/10 transition-all flex items-center justify-center group"
            aria-label="Clear chat"
          >
            <TrashIcon className="w-5 h-5 transition-colors group-hover:text-red-500" style={{ color: theme.text }} />
          </button>
        )}
        <button 
          onClick={handleClose}
          className="p-2 rounded-xl hover:bg-black/5 active:bg-black/10 transition-all flex items-center justify-center group"
          aria-label="Close chat"
        >
          <XMarkIcon className="h-5 w-5 transition-colors group-hover:text-red-500" style={{ color: theme.text }} />
        </button>
      </div>
    </div>
  );
};