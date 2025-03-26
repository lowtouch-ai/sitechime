import React, { useRef, useEffect } from 'react';
import { useChatContext } from './ChatContext';
import { ChevronDownIcon, ChevronUpIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Helper function to process message content with streaming thinking tokens
const processMessageContent = (content: string) => {
  console.log('Processing message content:', content);
  
  // First check if we have an unclosed thinking tag
  if (content.includes('<think>') && !content.includes('</think>')) {
    const parts = content.split('<think>');
    console.log('Found unclosed thinking tag, parts:', parts);
    return {
      regularContent: parts[0] || '',
      thinkingContent: parts[1] || '',
      inProgressThinking: true
    };
  }
  
  // Check for complete thinking tags
  const thinkingRegex = /<think>([\s\S]*?)<\/think>/g;
  let match;
  let regularContent = content;
  let thinkingContent = null;
  
  // Extract all thinking content (we'll only display the last one for simplicity)
  while ((match = thinkingRegex.exec(content)) !== null) {
    console.log('Found thinking content match:', match);
    thinkingContent = match[1]; // Store the content inside the tags
    regularContent = regularContent.replace(match[0], ''); // Remove the entire tag + content
  }
  
  console.log('Processed content result:', {
    regularContent: regularContent.trim(),
    thinkingContent,
    inProgressThinking: false
  });
  
  return { 
    regularContent: regularContent.trim(),
    thinkingContent,
    inProgressThinking: false
  };
};

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
  
  // Log messages when they change
  useEffect(() => {
    console.log('Messages in ChatMessageList changed:', messages);
  }, [messages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    console.log('Scrolling to bottom');
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
      
      {messages.map((msg, index) => {
        console.log(`Rendering message ${index}:`, msg);
        // Process message content to extract thinking tokens if they exist
        const { regularContent, thinkingContent, inProgressThinking } = processMessageContent(msg.content);
        const isThinkingExpanded = thinkingExpanded[index] || false;
        
        console.log(`Rendering message ${index}:`, {
          role: msg.role,
          content: msg.content,
          processedContent: { regularContent, thinkingContent, inProgressThinking }
        });
        
        return (
          <div
            key={msg.id || index}
            className={`chat-message ${
              msg.role === 'user' ? 'message-user ml-auto' : 'message-assistant mr-auto'
            }`}
            style={{
              backgroundColor: msg.role === 'user' ? theme.primary : theme.surface,
              color: msg.role === 'user' ? theme.secondary : theme.text,
            }}
          >
            {msg.role === 'assistant' && (
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
            
            {msg.role === 'user' && (
              <div className="flex items-center justify-end mb-1">
                <span className="text-xs font-medium">You</span>
              </div>
            )}
            
            {/* Render thinking section before regular content if thinking content exists */}
            {(thinkingContent || inProgressThinking) && msg.role === 'assistant' && (
              <div 
                className="thinking-section mb-2 pb-2 border-b" 
                style={{ 
                  borderColor: theme.border,
                  borderBottomWidth: '1px'
                }}
                data-testid="thinking-section"
              >
                <button 
                  onClick={() => toggleThinkingExpanded(index)} 
                  className="flex items-center justify-between text-xs w-full py-1 px-2 rounded hover:bg-gray-100 transition-colors"
                  style={{ 
                    color: theme.text,
                    backgroundColor: 'rgba(0,0,0,0.03)'
                  }}
                >
                  <span className="font-medium">
                    Thinking{inProgressThinking ? ' (in progress)' : ''}
                  </span>
                  {isThinkingExpanded ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
                
                <div 
                  className={`thinking-content mt-2 text-xs p-3 rounded whitespace-pre-wrap ${isThinkingExpanded ? '' : 'hidden'}`}
                  style={{ 
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    fontFamily: 'monospace',
                    border: '1px solid rgba(0,0,0,0.1)',
                    position: 'relative'
                  }}
                >
                  {thinkingContent || ''}
                  {inProgressThinking && (
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
            )}
            
            <div 
              className={`whitespace-pre-wrap text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
              data-testid="message-content"
            >
              {regularContent || ' '}
            </div>
          </div>
        );
      })}
      
      {/* Ensure only one loading indicator is shown when waiting for a stream */}
      {isLoading && !messages[messages.length - 1]?.content?.includes('<think>') && messages.length === 0 && (
        <div 
          className="chat-message message-assistant mr-auto"
          style={{ backgroundColor: theme.surface, color: theme.text }}
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
          
          <div className="typing-indicator">
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
      )}

      {/* Retry Button */}
      {showRetryButton && (
        <div className="flex justify-center">
          <button 
            onClick={retryLastMessage}
            className="retry-button flex items-center justify-center py-1 px-3 text-xs rounded-full border hover:bg-gray-100 transition-colors bg-white"
            style={{
              borderColor: theme.border,
              color: theme.text
            }}
            aria-label="Retry last message"
            title="Retry last message"
            data-testid="retry-button"
          >
            <ArrowPathIcon className="w-3 h-3 mr-1" />
            <span>Retry last message</span>
          </button>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};