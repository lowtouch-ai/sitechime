import React, { useEffect } from 'react';
// Import CSS as a raw string so we can inject it when the component is
// rendered directly (dev mode / local preview). When mounted via the
// UMD `mountChatWidget` function, the Shadow DOM injection path will be
// used instead and this effect will no-op.
import widgetCss from './ChatWidget.css?raw';

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
  , shadowRootRef
  } = useChatContext();

  // When the widget is rendered directly (no shadowRootRef provided),
  // inject the ChatWidget.css into document.head so styles appear during
  // `npm run dev`. Don't inject when a ShadowRoot is present (UMD mount).
  useEffect(() => {
    if (typeof document === 'undefined' || shadowRootRef) return;

    const styleId = 'openai-chat-widget-dev-css';
    if (document.getElementById(styleId)) return;

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = widgetCss;
    document.head.appendChild(styleEl);

    return () => {
      const el = document.getElementById(styleId);
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };
  }, [shadowRootRef]);

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
