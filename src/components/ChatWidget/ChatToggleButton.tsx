import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useChatContext } from './ChatContext';

export const ChatToggleButton: React.FC = () => {
  const { setIsOpen, isOpen, theme, config } = useChatContext();
  
  const buttonStyle = {
    backgroundColor: theme.primary,
    color: theme.secondary,
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    padding: 0,
    cursor: 'pointer'
  };
  
  return (
    <button 
      className="chat-toggle-button"
      onClick={() => setIsOpen(!isOpen)}
      style={buttonStyle}
      aria-label="Toggle chat"
    >
      {config?.branding.logo.url ? (
        <img 
          src={config.branding.logo.url} 
          alt="Chat"
          className="w-8 h-8 object-contain"
        />
      ) : (
        <ChatBubbleLeftRightIcon className="w-8 h-8" />
      )}
    </button>
  );
};