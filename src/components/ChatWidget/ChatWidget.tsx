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
import { joinUrl } from '../../utils/url';
import { toPx } from '../../utils/style';

// A wrapper component that uses the context
const ChatWidgetInner: React.FC = () => {
  const { 
    isOpen, 
    widgetPosition,
    isExpanded,
    setIsExpanded,
    theme,
    showTerms,
    shadowRootRef,
    config
  } = useChatContext();

  // When the widget is rendered directly (no shadowRootRef provided),
  // inject the ChatWidget.css into document.head so styles appear during
  // `npm run dev`. Don't inject when a ShadowRoot is present (UMD mount).
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Load custom CSS if enabled
    let customStyleEl: HTMLLinkElement | null = null;
    if (config?.branding.customCSS?.enabled && config.branding.customCSS.path) {
      customStyleEl = document.createElement('link');
      customStyleEl.rel = 'stylesheet';
      
      // Resolve path relative to config URL if it's relative
      let cssPath = config.branding.customCSS.path;
      if (cssPath.startsWith('/') && !cssPath.startsWith('//')) {
        // If we have a host in the config, use it as base
        if (config.security.api.host) {
          cssPath = joinUrl(config.security.api.host, cssPath);
        }
      }
      
      customStyleEl.href = cssPath;
      if (shadowRootRef) {
        shadowRootRef.appendChild(customStyleEl);
      } else {
        document.head.appendChild(customStyleEl);
      }
    }

    if (shadowRootRef) return;

    const styleId = 'openai-chat-widget-dev-css';
    if (document.getElementById(styleId)) return;

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = widgetCss;
    document.head.appendChild(styleEl);

    return () => {
      const el = document.getElementById(styleId);
      if (el && el.parentNode) el.parentNode.removeChild(el);
      if (customStyleEl && customStyleEl.parentNode) {
        customStyleEl.parentNode.removeChild(customStyleEl);
      }
    };
  }, [shadowRootRef, config]);

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
    bottom: isExpanded ? '0' : toPx(config?.widget.position.offset.vertical || 20),
    [widgetPosition === 'bottom-right' ? 'right' : 'left']: isExpanded ? '0' : toPx(config?.widget.position.offset.horizontal || 20),
    zIndex: config?.widget.zIndex || 9999,
    width: isExpanded ? '100%' : 'auto',
    height: isExpanded ? '100%' : 'auto',
    pointerEvents: 'none', // Allow clicks to pass through the outer container
  };

  // Remove containerStyle width and height since they'll be controlled by CSS classes
  const containerStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: isOpen ? 'flex' : 'none', // Use display: none when closed to prevent stealing focus
    flexDirection: 'column',
    width: isExpanded ? '100%' : toPx(config?.widget.dimensions.width),
    height: isExpanded ? '100%' : toPx(config?.widget.dimensions.height),
    minHeight: isExpanded ? '0' : toPx(config?.widget.dimensions.minHeight),
    maxWidth: isExpanded ? '100%' : toPx(config?.widget.dimensions.maxWidth),
    pointerEvents: 'auto', // Catch clicks on the window
    fontFamily: config?.branding.theme.fontFamily || 'inherit'
  };

  return (
    <div className={`chat-widget ${widgetPosition === 'bottom-right' ? 'chat-widget-right' : 'chat-widget-left'}`} 
      style={widgetStyle}>
      <ChatToggleButton />
      
      <div 
        className={`chat-window ${isOpen ? 'visible' : ''} ${isExpanded ? 'expanded' : ''} glass-effect shadow-2xl overflow-hidden flex flex-col`}
        style={{
          ...containerStyle,
          zIndex: 1001,
          border: `1px solid ${theme.border}33`, // 20% opacity border
          backgroundColor: `rgba(255, 255, 255, ${theme.glassmorphism.opacity})`,
          backdropFilter: `blur(${theme.glassmorphism.blur}) saturate(180%)`,
          WebkitBackdropFilter: `blur(${theme.glassmorphism.blur}) saturate(180%)`,
        }}
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
