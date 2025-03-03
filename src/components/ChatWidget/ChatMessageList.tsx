import React, { useRef, useEffect } from 'react';
import { useChatContext } from './ChatContext';

export const ChatMessageList: React.FC = () => {
  const { messages, isLoading, botName, botAvatarUrl, theme } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="chat-separator text-center text-sm text-gray-500 my-2">
          Start of conversation
        </div>
      )}
      
      {messages.map((msg, index) => (
        <div
          key={index}
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
          
          <div className={`whitespace-pre-wrap text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            {msg.content}
          </div>
        </div>
      ))}
      
      {isLoading && (
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
      
      <div ref={messagesEndRef} />
    </div>
  );
};