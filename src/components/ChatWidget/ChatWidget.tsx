import { useState } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, ArrowsPointingOutIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import './ChatWidget.css';
import { useChat } from '../../hooks/useChat';

interface ChatWidgetProps {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  welcomeMessage?: string;
  botName?: string;
  botAvatarUrl?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiKey,
  position = 'bottom-right',
  primaryColor = '#404040',
  welcomeMessage = 'Hello! How can I help you today?',
  botName = 'AI Assistant',
  botAvatarUrl = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  const { messages, isLoading, sendMessage, clearMessages } = useChat({
    apiKey,
    welcomeMessage,
  });

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={clsx(
      'chat-widget',
      position === 'bottom-right' ? 'chat-widget-right' : 'chat-widget-left'
    )}>
      {!isOpen && (
        <button 
          className="chat-toggle-button"
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: primaryColor }}
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
        </button>
      )}

      {isOpen && (
        <div className={clsx(
          'chat-window',
          isExpanded && 'chat-window-expanded'
        )}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              {botAvatarUrl ? (
                <img src={botAvatarUrl} alt={botName} className="chat-avatar" />
              ) : (
                <div className="chat-avatar-placeholder">
                  {botName.charAt(0)}
                </div>
              )}
              <span className="chat-bot-name">{botName}</span>
            </div>
            <div className="chat-header-actions">
              <button onClick={clearMessages} className="header-button" title="New Chat">
                <PlusIcon className="w-5 h-5" />
              </button>
              <button onClick={() => setIsExpanded(!isExpanded)} className="header-button" title="Toggle Fullscreen">
                <ArrowsPointingOutIcon className="w-5 h-5" />
              </button>
              <button onClick={() => setIsOpen(false)} className="header-button" title="Close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={clsx(
                  'chat-message',
                  message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'
                )}
              >
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message chat-message-bot">
                <div className="message-content typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <textarea
              className="chat-input"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
            />
            <button
              className="chat-send-button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              style={{ backgroundColor: primaryColor }}
            >
              <svg viewBox="0 0 24 24" className="send-icon">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
