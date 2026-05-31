import React, { useRef, useEffect } from 'react';
import { useChatContext } from './ChatContext';
import { ChatMessage } from './messages/ChatMessage';
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
  }, [messages, isLoading]);

  // Determine if we should show the retry button (suppress for auth errors — retrying won't help)
  const lastMessage = messages[messages.length - 1];
  const showRetryButton = messages.length >= 2 &&
    lastMessage?.role === 'assistant' &&
    !isLoading &&
    !(lastMessage as any).isAuthError;
  
  return (
    <div 
      className="chat-messages flex-1 overflow-y-auto p-4 space-y-4"
      style={{ backgroundColor: `rgba(255, 255, 255, ${theme.glassmorphism.opacity * 0.8})` }}
    >
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
          fileAttachment={msg.fileAttachment}
          ragFiles={msg.ragFiles}
          isLastMessage={index === messages.length - 1}
          isAuthError={(msg as any).isAuthError}
        />
      ))}

      {/* Only show retry button when not loading */}
      {showRetryButton && !isLoading && (
        <RetryButton onRetry={retryLastMessage} theme={theme} />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};