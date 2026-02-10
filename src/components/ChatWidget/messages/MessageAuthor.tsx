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
      <div className="flex items-center mb-1.5 opacity-60">
        {botAvatarUrl ? (
          <img 
            src={botAvatarUrl} 
            alt={botName}
            className="w-4 h-4 rounded-full mr-1.5 border border-black/5"
          />
        ) : (
          <div 
            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold mr-1.5"
            style={{ backgroundColor: theme.primary, color: theme.secondary }}
          >
            {botName.charAt(0)}
          </div>
        )}
        <span className="text-[10px] font-bold uppercase tracking-wider">{botName}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-end mb-1.5 opacity-60">
      <span className="text-[10px] font-bold uppercase tracking-wider">You</span>
    </div>
  );
};