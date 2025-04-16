import React, { useState, useEffect } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { ChatTheme } from '../types';

interface ThinkingSectionProps {
  content: string;
  isExpanded: boolean;
  onToggle: () => void;
  theme: ChatTheme;
  inProgress?: boolean;
}

export const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  content,
  isExpanded,
  onToggle,
  theme,
  inProgress = false,
}) => {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (inProgress) {
      // Start a timer when thinking is in progress
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inProgress]);
  
  return (
    <div 
      className="thinking-section mb-3 pb-2"
      style={{ 
        borderBottom: `1px solid ${theme.border}`,
        borderRadius: '4px',
        overflow: 'hidden'
      }}
      data-testid="thinking-section"
    >
      <button 
        onClick={onToggle} 
        className="flex items-center justify-between w-full py-2 px-3 transition-colors"
        style={{ 
          color: theme.text,
          backgroundColor: `${theme.primary}10`,
          fontSize: '0.85rem',
          borderRadius: '4px'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">Thoughts</span>
          {inProgress && (
            <div className="flex items-center">
              <span className="text-xs opacity-75">({seconds}s)</span>
              {!isExpanded && (
                <div 
                  className="ml-2 w-3 h-3 rounded-full border-2 animate-spin" 
                  style={{ 
                    borderColor: `${theme.primary}60`,
                    borderTopColor: 'transparent'
                  }} 
                />
              )}
            </div>
          )}
        </div>
        <div 
          className="transition-transform duration-200"
          style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }}
        >
          <ChevronUpIcon className="w-4 h-4" />
        </div>
      </button>
      
      <div 
        className={`thinking-content mt-2 rounded transition-all duration-200 ease-in-out ${isExpanded ? ' p-3 max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden p-0'}`}
        style={{ 
          backgroundColor: `${theme.primary}05`,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.85rem',
          border: isExpanded ? `1px solid ${theme.border}` : 'none',
          marginLeft: '8px',
          marginRight: '8px',
          lineHeight: '1.5'
        }}
      >
        {content}
        {inProgress && isExpanded && (
          <div className="typing-indicator flex space-x-1 mt-3 pl-1">
            <div 
              className="animate-pulse"
              style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: theme.primary, 
                borderRadius: '50%',
                animationDuration: '1s'
              }}
            ></div>
            <div 
              className="animate-pulse"
              style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: theme.primary, 
                borderRadius: '50%',
                animationDuration: '1s',
                animationDelay: '0.2s'
              }}
            ></div>
            <div 
              className="animate-pulse"
              style={{ 
                width: '6px', 
                height: '6px', 
                backgroundColor: theme.primary, 
                borderRadius: '50%',
                animationDuration: '1s',
                animationDelay: '0.4s'
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};