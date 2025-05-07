import React, { useEffect } from 'react';
// Import is not needed as we're injecting CSS directly into Shadow DOM
// import './ChatWidget.css';

import { ChatProvider } from './ChatContext';
import { ChatToggleButton } from './ChatToggleButton';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { PoweredByFooter } from './PoweredByFooter';
import { TermsAndConditions } from './TermsAndConditions';
import type { ChatWidgetProps } from './types';
import { useChatContext } from './ChatContext';

// A wrapper component that uses the context
const ChatWidgetInner: React.FC = () => {
  const { 
    isOpen, 
    widgetPosition,
    isExpanded,
    setIsExpanded,
    theme,
    showTerms
  } = useChatContext();

  // Add event listener for ESC key to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, setIsExpanded]);

  // Calculate widget position
  const widgetStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    [widgetPosition === 'bottom-right' ? 'right' : 'left']: '20px',
    zIndex: 9999
  };

  // Remove containerStyle width and height since they'll be controlled by CSS classes
  const containerStyle: React.CSSProperties = {
    backgroundColor: theme.background,
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div className={`chat-widget ${widgetPosition === 'bottom-right' ? 'chat-widget-right' : 'chat-widget-left'}`} 
      style={widgetStyle}>
      <ChatToggleButton />
      
      <div 
        className={`chat-window ${isOpen ? 'visible' : ''} ${isExpanded ? 'expanded' : ''}`} 
        style={containerStyle}
      >
        <ChatHeader />
        
        {showTerms ? (
          <TermsAndConditions />
        ) : (
          <ChatMessageList />
        )}
        
        <ChatInput />
        <PoweredByFooter />
      </div>
    </div>
  );
};

// The main component that provides the context
export const ChatWidget: React.FC<ChatWidgetProps> = (props) => {
  return (
    <ChatProvider {...props}>
      <ChatWidgetInner />
    </ChatProvider>
  );
};
