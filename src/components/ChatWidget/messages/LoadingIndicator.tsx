import React from 'react';
import { ChatTheme } from '../types';

interface LoadingIndicatorProps {
  botName: string;
  botAvatarUrl?: string;
  theme: ChatTheme;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ botName, botAvatarUrl, theme }) => (
  <div 
    className="chat-message message-assistant mr-auto"
    style={{ backgroundColor: theme.background, color: theme.text }}
  >
    <div className="flex items-center mb-1">
      {botAvatarUrl ? (
        <img 
          src={botAvatarUrl} 
          alt={botName}
          className="w-5 h-5 rounded-full mr-2"
        />
      ) : (
        <div 
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mr-2"
          style={{ backgroundColor: theme.primary, color: theme.secondary }}
        >
          {botName.charAt(0)}
        </div>
      )}
      <span className="text-xs font-medium">{botName}</span>
    </div>
    
    <div className="typing-indicator" style={{ border: `1px solid ${theme.primary}20` }}>
      <div 
        className="typing-indicator-dot"
        style={{ backgroundColor: theme.primary }}
      ></div>
      <div 
        className="typing-indicator-dot"
        style={{ backgroundColor: theme.primary }}
      ></div>
      <div 
        className="typing-indicator-dot"
        style={{ backgroundColor: theme.primary }}
      ></div>
    </div>
  </div>
);