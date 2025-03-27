import React from 'react';
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
}) => (
  <div 
    className="thinking-section mb-2 pb-2 border-b" 
    style={{ 
      borderColor: theme.border,
      borderBottomWidth: '1px'
    }}
    data-testid="thinking-section"
  >
    <button 
      onClick={onToggle} 
      className="flex items-center justify-between text-xs w-full py-1 px-2 rounded hover:bg-gray-100 transition-colors"
      style={{ 
        color: theme.text,
        backgroundColor: 'rgba(0,0,0,0.03)'
      }}
    >
      <span className="font-medium">
        Thinking{inProgress ? ' (in progress)' : ''}
      </span>
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
        <div className="typing-indicator" style={{ padding: '2px' }}>
          <div 
            className="typing-indicator-dot"
            style={{ width: '4px', height: '4px', backgroundColor: theme.primary }}
          ></div>
          <div 
            className="typing-indicator-dot"
            style={{ width: '4px', height: '4px', backgroundColor: theme.primary }}
          ></div>
          <div 
            className="typing-indicator-dot"
            style={{ width: '4px', height: '4px', backgroundColor: theme.primary }}
          ></div>
        </div>
      )}
    </div>
  </div>
);