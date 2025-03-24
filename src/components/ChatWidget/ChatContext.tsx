import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useChat } from '../../hooks/useChat';
import { fetchWidgetConfig } from '../../services/configService';
import type { WidgetConfig } from '../../types/widgetConfig';

// Updated Message interface matching useChat.ts
interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

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

// Map to track expanded state of thinking sections by message index
type ThinkingExpandedMap = Record<number, boolean>;

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
  retryLastMessage: () => void;
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
  thinkingExpanded: ThinkingExpandedMap;
  toggleThinkingExpanded: (messageIndex: number) => void;
  termsAccepted: boolean;
  acceptTerms: () => void;
  declineTerms: () => void;
  showTerms: boolean;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// Local storage key for terms acceptance
const TERMS_ACCEPTED_KEY = 'chat-widget-terms-accepted';

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
  // Initialize thinking sections to be expanded by default
  const [thinkingExpanded, setThinkingExpanded] = useState<ThinkingExpandedMap>({});
  
  // Terms and conditions state
  const [termsAccepted, setTermsAccepted] = useState(() => {
    // Check localStorage for saved preference
    return localStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
  });
  const [showTerms, setShowTerms] = useState(!termsAccepted);

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

  const { messages, isLoading, sendMessage, clearMessages, abortStreaming, retryLastMessage } = useChat({
    apiKey,
    welcomeMessage: config?.branding.poweredBy.text || welcomeMessage,
    endpoint: config?.security.api.endpoint,
    timeoutMs: config?.security.api.timeout,
    maxRetries: config?.security.authentication.maxRetries,
  });

  // Log whenever messages change to help debug
  useEffect(() => {
    console.log('ChatContext received updated messages:', messages);
  }, [messages]);

  // When messages change, automatically set any new messages with thinking content to expanded
  useEffect(() => {
    const newThinkingExpanded = { ...thinkingExpanded };
    let updated = false;
    
    messages.forEach((msg, index) => {
      // If this message has thinking content and doesn't have an expanded state yet,
      // set it to expanded by default
      if (msg.role === 'assistant' && 
          msg.content.includes('<think>') && 
          thinkingExpanded[index] === undefined) {
        newThinkingExpanded[index] = true;
        updated = true;
      }
    });
    
    if (updated) {
      setThinkingExpanded(newThinkingExpanded);
    }
  }, [messages, thinkingExpanded]);

  const handleSend = (message: string) => {
    if (message.trim() && termsAccepted) {
      console.log('ChatContext: Sending message:', message);
      sendMessage(message);
      setInputValue('');
      if (config?.widget.behavior.autoExpand) {
        setIsExpanded(true);
      }
    }
  };

  // Toggle expanded state for thinking sections
  const toggleThinkingExpanded = (messageIndex: number) => {
    setThinkingExpanded(prev => ({
      ...prev,
      [messageIndex]: !prev[messageIndex]
    }));
  };

  // Handle terms and conditions accept/decline
  const acceptTerms = () => {
    setTermsAccepted(true);
    setShowTerms(false);
    // Save to localStorage so user doesn't have to accept again
    localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
  };

  const declineTerms = () => {
    setIsOpen(false);
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
    retryLastMessage,
    theme,
    botName: botName,
    botAvatarUrl: config?.branding.logo.url || botAvatarUrl,
    widgetPosition: position,
    inputValue,
    setInputValue,
    thinkingExpanded,
    toggleThinkingExpanded,
    termsAccepted,
    acceptTerms,
    declineTerms,
    showTerms
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