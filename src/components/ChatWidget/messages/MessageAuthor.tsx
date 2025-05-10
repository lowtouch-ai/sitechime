import React from 'react';
import { ChatTheme } from '../types';

interface MessageAuthorProps {
  role: 'user' | 'assistant';
  botName: string;
  botAvatarUrl?: string;
  theme: ChatTheme;
}

export const MessageAuthor: React.FC<MessageAuthorProps> = ({
  role,
  botName,
  botAvatarUrl,
  theme
}) => {
  if (role === 'assistant') {
    return (
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
    );
  }
  
  return (
    <div className="flex items-center justify-end mb-1">
      <span className="text-xs font-medium">You</span>
    </div>
  );
};