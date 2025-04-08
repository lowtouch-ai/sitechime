import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
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
  seconds
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (inProgress) {
      // Start a timer when thinking is in progress
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else {
      // Keep the final seconds count when thinking completes
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [inProgress]);
  
  return (
  <div 
    className="thinking-section mb-2 pb-2 border-b" 
    style={{ 
      borderColor: theme.border,
      borderBottomWidth: '1px'
    }}
    data-testid="thinking-section"
  >    <button 
      onClick={onToggle} 
      className="flex items-center justify-between text-xs w-full py-1 px-2 rounded hover:bg-gray-100 transition-colors"
      style={{ 
        color: theme.text,
        backgroundColor: 'rgba(0,0,0,0.03)'
      }}
    >
      <div className="flex items-center">
        {/* <span className="font-medium mr-2">
          Thought for {seconds} seconds{inProgress ? ' (in progress)' : ''}
        </span> */}
        <span className="font-medium mr-2">
          Thoughts
        </span>
        {!isExpanded && inProgress && (
          <div className="circular-progress w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" 
               style={{ 
                 borderColor: `${theme.primary}40`,
                 borderTopColor: 'transparent'
               }} 
          />
        )}
      </div>
      {isExpanded ? (
        <ChevronUpIcon className="w-4 h-4" />
      ) : (
        <ChevronDownIcon className="w-4 h-4" />
      )}
    </button>
    
    <div 
      className={`thinking-content mt-2 text-xs p-3 rounded whitespace-pre-wrap ${isExpanded ? '' : 'hidden'}`}
      style={{ 
        backgroundColor: 'rgba(0,0,0,0.05)',
        fontFamily: 'monospace',
        border: '1px solid rgba(0,0,0,0.1)',
        position: 'relative'
      }}
    >
      {content}
      {inProgress && (
        <div className="typing-indicator flex space-x-1 mt-2" style={{ padding: '2px' }}>
          <div 
            className="typing-indicator-dot animate-bounce delay-0"
            style={{ width: '4px', height: '4px', backgroundColor: theme.primary, borderRadius: '50%' }}
          ></div>
          <div 
            className="typing-indicator-dot animate-bounce delay-150"
            style={{ width: '4px', height: '4px', backgroundColor: theme.primary, borderRadius: '50%', animationDelay: '0.15s' }}
          ></div>
          <div 
            className="typing-indicator-dot animate-bounce delay-300"
            style={{ width: '4px', height: '4px', backgroundColor: theme.primary, borderRadius: '50%', animationDelay: '0.3s' }}
          ></div>
        </div>
      )}
    </div>
  </div>
  );
};