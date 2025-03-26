import React from 'react';
import { ChatTheme } from '../types';
import { ThinkingSection } from './ThinkingSection';

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
  botName: string;
  botAvatarUrl?: string;
  theme: ChatTheme;
  thinkingExpanded: boolean;
  onToggleThinking: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  botName,
  botAvatarUrl,
  theme,
  thinkingExpanded,
  onToggleThinking
}) => {
  // Process message content to extract thinking tokens
  const processMessageContent = (content: string) => {
    if (content.includes('<think>') && !content.includes('</think>')) {
      const parts = content.split('<think>');
      return {
        regularContent: parts[0] || '',
        thinkingContent: parts[1] || '',
        inProgressThinking: true
      };
    }
    
    const thinkingRegex = /<think>([\s\S]*?)<\/think>/g;
    let match;
    let regularContent = content;
    let thinkingContent = null;
    
    while ((match = thinkingRegex.exec(content)) !== null) {
      thinkingContent = match[1];
      regularContent = regularContent.replace(match[0], '');
    }
    
    return { 
      regularContent: regularContent.trim(),
      thinkingContent,
      inProgressThinking: false
    };
  };

  const { regularContent, thinkingContent, inProgressThinking } = processMessageContent(content);

  return (
    <div
      className={`chat-message ${
        role === 'user' ? 'message-user ml-auto' : 'message-assistant mr-auto'
      }`}
      style={{
        backgroundColor: role === 'user' ? theme.primary : theme.surface,
        color: role === 'user' ? theme.secondary : theme.text,
      }}
    >
      {role === 'assistant' && (
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
      )}
      
      {role === 'user' && (
        <div className="flex items-center justify-end mb-1">
          <span className="text-xs font-medium">You</span>
        </div>
      )}
      
      {(thinkingContent || inProgressThinking) && role === 'assistant' && (
        <ThinkingSection
          content={thinkingContent || ''}
          isExpanded={thinkingExpanded}
          onToggle={onToggleThinking}
          theme={theme}
          inProgress={inProgressThinking}
        />
      )}
      
      <div 
        className={`whitespace-pre-wrap text-sm ${role === 'user' ? 'text-right' : 'text-left'}`}
        data-testid="message-content"
      >
        {regularContent || ' '}
      </div>
    </div>
  );
};