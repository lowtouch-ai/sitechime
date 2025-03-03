import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useChat } from '../../hooks/useChat';
import { fetchWidgetConfig } from '../../services/configService';
import type { WidgetConfig } from '../../types/widgetConfig';
import type { Message } from '../../types/chat';

interface ChatContextProps {
  apiKey: string;
  configUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  secondaryColor?: string;
  welcomeMessage?: string;
  botName?: string;
  botAvatarUrl?: string;
}

interface ChatContextValue {
  config: WidgetConfig | null;
  error: string | null;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  messages: Message[];
  isLoading: boolean;
  sendMessage: (message: string) => void;
  clearMessages: () => void;
  abortStreaming: () => void;
  theme: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
    surface: string;
  };
  botName: string;
  botAvatarUrl: string;
  widgetPosition: 'bottom-right' | 'bottom-left';
  inputValue: string;
  setInputValue: (value: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const ChatProvider: React.FC<ChatContextProps & { children: ReactNode }> = ({
  children,
  apiKey,
  configUrl,
  position = 'bottom-right',
  primaryColor = '#0066cc',
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

  const { messages, isLoading, sendMessage, clearMessages, abortStreaming } = useChat({
    apiKey,
    welcomeMessage: config?.branding.poweredBy.text || welcomeMessage,
    endpoint: config?.security.api.endpoint,
    timeoutMs: config?.security.api.timeout,
    maxRetries: config?.security.authentication.maxRetries,
  });

  const handleSend = (message: string) => {
    if (message.trim()) {
      sendMessage(message);
      setInputValue('');
      if (config?.widget.behavior.autoExpand) {
        setIsExpanded(true);
      }
    }
  };

  const theme = {
    primary: config?.branding.theme.primaryColor || primaryColor,
    secondary: config?.branding.theme.secondaryColor || secondaryColor,
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    border: '#e5e7eb'
  };

  const value = {
    config,
    error,
    isOpen,
    setIsOpen,
    isExpanded,
    setIsExpanded,
    messages,
    isLoading,
    sendMessage: handleSend,
    clearMessages,
    abortStreaming,
    theme,
    botName: botName,
    botAvatarUrl: config?.branding.logo.url || botAvatarUrl,
    widgetPosition: position,
    inputValue,
    setInputValue
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};