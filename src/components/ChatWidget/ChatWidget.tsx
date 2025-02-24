import { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  PlusIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import './ChatWidget.css';
import { useChat } from '../../hooks/useChat';
import { generateTheme } from './theme';
import { fetchWidgetConfig } from '../../services/configService';
import type { WidgetConfig } from '../../types/widgetConfig';

export interface ChatWidgetProps {
  apiKey: string;
  configUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  secondaryColor?: string;
  welcomeMessage?: string;
  botName?: string;
  botAvatarUrl?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiKey,
  configUrl,
  position = 'bottom-right',
  primaryColor = '#404040',
  secondaryColor = '#ffffff',
  welcomeMessage = 'Hello! How can I help you today?',
  botName = 'AI Assistant',
  botAvatarUrl = '',
}) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const widgetConfig = await fetchWidgetConfig(configUrl);
        setConfig(widgetConfig);
        
        // Apply initial configuration
        if (widgetConfig.widget.behavior.initialState === 'expanded') {
          setIsExpanded(true);
          setIsOpen(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
        console.error('Failed to load widget configuration:', err);
      }
    };

    loadConfig();
  }, [configUrl]);

  const { messages, isLoading, sendMessage, clearMessages } = useChat({
    apiKey,
    welcomeMessage: config?.branding.poweredBy.text || welcomeMessage,
    endpoint: config?.security.api.endpoint,
    timeoutMs: config?.security.api.timeout,
    maxRetries: config?.security.authentication.maxRetries,
  });

  // Message buffer management
  useEffect(() => {
    if (config?.features.performance.messageBuffer && messages.length > config.features.performance.messageBuffer) {
      clearMessages();
    }
  }, [messages, config?.features.performance.messageBuffer]);

  // Auto-expand on new messages
  useEffect(() => {
    if (config?.widget.behavior.autoExpand && messageCount < messages.length) {
      setIsExpanded(true);
      setIsOpen(true);
    }
    setMessageCount(messages.length);
  }, [messages.length, config?.widget.behavior.autoExpand]);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
      
      if (config?.widget.behavior.autoExpand) {
        setIsExpanded(true);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const theme = generateTheme(
    config?.branding.theme.primaryColor || primaryColor,
    config?.branding.theme.secondaryColor || secondaryColor
  );

  const widgetStyle = {
    position: 'fixed' as const,
    right: `${config?.widget.position.offset.horizontal || 20}px`,
    bottom: `${config?.widget.position.offset.vertical || 20}px`,
    zIndex: 9999,
  };

  const containerStyle = {
    width: `${config?.widget.dimensions.width || 350}px`,
    height: isExpanded ? `${config?.widget.dimensions.height || 500}px` : `${config?.widget.dimensions.minHeight || 300}px`,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: config?.branding.theme.fontFamily || 'inherit',
    backgroundColor: theme.background,
    color: theme.text,
    borderColor: theme.border,
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
  };

  const buttonStyle = {
    backgroundColor: theme.primary,
    color: theme.secondary,
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    padding: '0',
  };

  const messageStyle = {
    userMessage: {
      backgroundColor: theme.primary,
      color: theme.secondary,
    },
    botMessage: {
      backgroundColor: theme.surface,
      color: theme.text,
    },
  };

  return (
    <div style={widgetStyle}>
      {/* Toggle Button */}
      <button 
        className="chat-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        style={buttonStyle}
      >
        {config?.branding.logo.url ? (
          <img 
            src={config.branding.logo.url} 
            alt="Chat"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
            }}
          />
        ) : (
          <ChatBubbleLeftRightIcon style={{ width: '32px', height: '32px' }} />
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={clsx(
          'chat-window',
          isOpen ? 'visible' : 'invisible'
        )}
        style={containerStyle}
      >
        {/* Header */}
        <div className="chat-header" style={{
          backgroundColor: theme.surface,
          borderBottom: `1px solid ${theme.border}`,
          color: theme.text,
          minHeight: '60px',
          flexShrink: 0,
        }}>
          <div className="chat-header-left">
            {config?.branding.logo.url ? (
              <img 
                src={config.branding.logo.url}
                alt={botName}
                className="chat-avatar"
                style={{
                  width: '32px',
                  height: '32px',
                }}
              />
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
        <div className="chat-messages" ref={messagesRef} style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
        }}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={clsx(
                'chat-message',
                message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'
              )}
              style={message.role === 'user' ? messageStyle.userMessage : messageStyle.botMessage}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="chat-message chat-message-bot typing-indicator">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="chat-input-container" style={{
          borderTop: `1px solid ${theme.border}`,
          backgroundColor: theme.surface,
          minHeight: '76px',
          flexShrink: 0,
        }}>
          <textarea
            className="chat-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={1}
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.border,
            }}
          />
          <button
            className="chat-send-button"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            style={{
              backgroundColor: theme.primary,
              color: theme.secondary,
              opacity: (!inputValue.trim() || isLoading) ? 0.5 : 1,
            }}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Powered By */}
        {config?.branding.poweredBy.visible && (
          <div style={{ 
            padding: '8px', 
            textAlign: 'center', 
            fontSize: '12px',
            color: theme.textSecondary,
            borderTop: `1px solid ${theme.border}`,
            backgroundColor: theme.surface,
            flexShrink: 0,
          }}>
            {config.branding.poweredBy.text}
          </div>
        )}
      </div>
    </div>
  );
};
