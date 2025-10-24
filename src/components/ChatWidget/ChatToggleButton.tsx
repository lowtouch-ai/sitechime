import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useChatContext } from './ChatContext';

export const ChatToggleButton: React.FC = () => {
  const { setIsOpen, isOpen, setIsExpanded, isExpanded, theme, config } = useChatContext();
  
  const buttonBackground = config?.branding.toggleButton?.backgroundColor || theme.primary;

  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: theme.icons.toggle,
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
  
  // Determine which icon to use (toggleButtonIcon first, then logo, then default icon)
  const toggleIconUrl = config?.branding.toggleButtonIcon?.url;
  const logoUrl = config?.branding.logo.url;
  
  const handleToggle = () => {
    // If closing the chat, also reset expanded state
    if (isOpen && isExpanded) {
      setIsExpanded(false);
    }
    setIsOpen(!isOpen);
  };
  
  return (
    <button 
      className="chat-toggle-button"
      onClick={handleToggle}
      style={buttonStyle}
      aria-label="Toggle chat"
    >
      {toggleIconUrl ? (
        <img 
          src={toggleIconUrl} 
          alt="Chat"
          className="w-8 h-8 object-contain"
        />
      ) : logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Chat"
          className="w-8 h-8 object-contain"
        />
      ) : (
        <ChatBubbleLeftRightIcon className="w-8 h-8" style={{ color: theme.icons.toggle }} />
      )}
    </button>
  );
};