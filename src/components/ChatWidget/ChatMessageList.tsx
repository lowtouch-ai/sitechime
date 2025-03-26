import React, { useRef, useEffect } from 'react';
import { useChatContext } from './ChatContext';
import { ChatMessage } from './messages/ChatMessage';
import { LoadingIndicator } from './messages/LoadingIndicator';
import { RetryButton } from './messages/RetryButton';

export const ChatMessageList: React.FC = () => {
  const { 
    messages, 
    isLoading, 
    botName, 
    botAvatarUrl, 
    theme,
    thinkingExpanded,
    toggleThinkingExpanded,
    retryLastMessage
  } = useChatContext();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Determine if we should show the retry button
  const showRetryButton = messages.length >= 2 && 
    messages[messages.length - 1]?.role === 'assistant' && 
    !isLoading;
  
  return (
    <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="chat-separator text-center text-sm text-gray-500 my-2">
          Start of conversation
        </div>
      )}
      
      {messages.map((msg, index) => (
        <ChatMessage
          key={msg.id || index}
          content={msg.content}
          role={msg.role}
          botName={botName}
          botAvatarUrl={botAvatarUrl}
          theme={theme}
          thinkingExpanded={thinkingExpanded[index] || false}
          onToggleThinking={() => toggleThinkingExpanded(index)}
        />
      ))}
      
      {isLoading && !messages[messages.length - 1]?.content?.includes('<think>') && messages.length === 0 && (
        <LoadingIndicator 
          botName={botName}
          botAvatarUrl={botAvatarUrl}
          theme={theme}
        />
      )}

      {showRetryButton && (
        <RetryButton onRetry={retryLastMessage} theme={theme} />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};