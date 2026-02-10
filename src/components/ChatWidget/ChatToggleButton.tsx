import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useChatContext } from './ChatContext';

export const ChatToggleButton: React.FC = () => {
  const { setIsOpen, isOpen, setIsExpanded, isExpanded, theme, config, toggleButtonDimensions } = useChatContext();
  
  const buttonBackground = config?.branding.toggleButton?.backgroundColor || theme.primary;
  const iconColor = config?.branding.icons?.toggle || theme.secondary;

  const buttonStyle = {
    backgroundColor: buttonBackground,
    color: iconColor,
    width: config?.branding.toggleButton?.size ? `${config.branding.toggleButton.size}px` : '60px',
    height: config?.branding.toggleButton?.size ? `${config.branding.toggleButton.size}px` : '60px',
    borderRadius: config?.branding.toggleButton?.borderRadius || '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    padding: 0,
    cursor: 'pointer',
    pointerEvents: 'auto' as const
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
          style={{ 
            width: toggleButtonDimensions?.width ? `${toggleButtonDimensions.width}px` : '32px', 
            height: toggleButtonDimensions?.height ? `${toggleButtonDimensions.height}px` : '32px' 
          }}
          className="object-contain"
        />
      ) : logoUrl ? (
        <img 
          src={logoUrl} 
          alt="Chat"
          style={{ 
            width: toggleButtonDimensions?.width ? `${toggleButtonDimensions.width}px` : '32px', 
            height: toggleButtonDimensions?.height ? `${toggleButtonDimensions.height}px` : '32px' 
          }}
          className="object-contain"
        />
      ) : (
        <ChatBubbleLeftRightIcon className="w-8 h-8" style={{ color: iconColor }} />
      )}
    </button>
  );
};