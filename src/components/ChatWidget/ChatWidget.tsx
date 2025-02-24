import { useState, useEffect, useRef } from 'react';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
  Button,
  InfoButton,
  TypingIndicator,
  MessageSeparator,
  Status
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './ChatWidget.css';
import { useChat } from '../../hooks/useChat';
import { generateTheme } from './theme';
import { fetchWidgetConfig } from '../../services/configService';
import type { ChatWidgetProps } from './types';

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
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const widgetConfig = await fetchWidgetConfig(configUrl);
        setConfig(widgetConfig);
        
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

  const handleSend = (message: string) => {
    if (message.trim()) {
      sendMessage(message);
      if (config?.widget.behavior.autoExpand) {
        setIsExpanded(true);
      }
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
    width: `${config?.widget.dimensions.width || 400}px`,
    height: '100%',
    backgroundColor: theme.background,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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

  return (
    <div style={widgetStyle} className={position}>
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
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
        ) : (
          <ChatBubbleLeftRightIcon className="w-8 h-8" />
        )}
      </button>

      <div className={`chat-window ${isOpen ? 'visible' : 'invisible'}`} style={containerStyle}>
        <MainContainer responsive>
          <ChatContainer>
            <ConversationHeader>
              <Avatar src={botAvatarUrl || undefined} name={botName} status={<Status status="available" />} />
              <ConversationHeader.Content userName={botName} info="AI Assistant" />
              <ConversationHeader.Actions>
                <Button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  icon={isExpanded ? 
                    <ArrowsPointingInIcon className="w-5 h-5" /> : 
                    <ArrowsPointingOutIcon className="w-5 h-5" />
                  }
                />
                <Button 
                  onClick={clearMessages}
                  icon={<TrashIcon className="w-5 h-5" />}
                />
                <Button 
                  onClick={() => setIsOpen(false)}
                  icon={<XMarkIcon className="w-5 h-5" />}
                />
              </ConversationHeader.Actions>
            </ConversationHeader>

            <MessageList 
              ref={messagesRef}
              typingIndicator={isLoading && <TypingIndicator content="AI is thinking" />}
            >
              {messages.length === 0 && (
                <MessageSeparator content="Start of conversation" />
              )}
              
              {messages.map((msg, index) => (
                <Message
                  key={index}
                  model={{
                    message: msg.content,
                    sentTime: "now",
                    sender: msg.role === 'user' ? "You" : botName,
                    direction: msg.role === 'user' ? "outgoing" : "incoming",
                    position: "single"
                  }}
                  avatarPosition={msg.role === 'user' ? undefined : "tl"}
                  avatarSpacer={msg.role === 'user'}
                >
                  <Message.Header sender={msg.role === 'user' ? "You" : botName} />
                  <Message.CustomContent>
                    <div style={{ 
                      whiteSpace: 'pre-wrap',
                      textAlign: 'left'
                    }}>
                      {msg.content}
                    </div>
                  </Message.CustomContent>
                </Message>
              ))}
            </MessageList>

            <MessageInput
              placeholder="Type message here"
              onSend={handleSend}
              attachButton={false}
              sendButton={true}
              autoFocus={isOpen}
            />
          </ChatContainer>
        </MainContainer>

        {config?.branding.poweredBy.visible && (
          <div className="powered-by">
            {config.branding.poweredBy.text}
          </div>
        )}
      </div>
    </div>
  );
};
