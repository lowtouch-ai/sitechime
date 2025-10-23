import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useChat } from '../../hooks/useChat';
import { fetchWidgetConfig } from '../../services/configService';
import type { WidgetConfig } from '../../types/widgetConfig';
import { FileAttachment, RAGFile } from '../../types/chat';
import type { ChatTheme } from './types';
// Import the new setConfigUrl functions
import { setConfigUrl as setRagConfigUrl } from '../../services/ragService';
import { setConfigUrl as setChatConfigUrl, setExternalHeaders } from '../../services/chatService';

// Updated Message interface matching useChat.ts
interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
  fileAttachment?: FileAttachment;
  ragFiles?: RAGFile[]; // Add ragFiles property to fix the error
}

interface ChatContextProps {
  apiKey: string;
  configUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  secondaryColor?: string;
  theme?: Partial<ChatTheme>;
  welcomeMessage?: string;
  botName?: string;
  botAvatarUrl?: string;
  shadowRootRef?: ShadowRoot | null; // Add reference to the shadow root
  externalHeaders?: Record<string, string> | undefined; // Forwarded headers from host page
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
  sendMessage: (message: string, fileAttachment?: FileAttachment, ragFiles?: RAGFile[]) => void;
  clearMessages: () => void;
  abortStreaming: () => void;
  retryLastMessage: () => void;
  theme: ChatTheme;
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
  fileAttachment: FileAttachment | null;
  setFileAttachment: (file: FileAttachment | null) => void;
  // New RAG-related fields
  ragFiles: RAGFile[];
  addRagFile: (file: RAGFile) => void;
  removeRagFile: (fileId: string) => void;
  uploadError: string | null;
  apiKey: string; // Add this property to fix the error
  shadowRootRef: ShadowRoot | null; // Add reference to the shadow root
  externalHeaders?: Record<string, string> | undefined;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// Local storage key for terms acceptance
const TERMS_ACCEPTED_KEY = 'chat-widget-terms-accepted';

const recordTermsAcceptance = async (configId: string) => {
  try {
    const apiUrl = `${import.meta.env.VITE_BACKEND_API_URL}/api/tnc/accept/`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config_id: configId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to record terms acceptance');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error recording terms acceptance:', error);
    // Still allow the user to proceed even if the API call fails
  }
};

export const ChatProvider: React.FC<ChatContextProps & { children: ReactNode }> = ({
  children,
  apiKey,  // This is actually the configId
  configUrl,
  position = 'bottom-right',
  primaryColor = '#0066cc',
  secondaryColor = '#ffffff',
  theme: themeOverride,
  welcomeMessage = 'Hello! How can I help you today?',
  botName = 'AI Assistant',
  botAvatarUrl = '',
  shadowRootRef = null, // Add shadowRootRef prop with default value
  externalHeaders = undefined,
}) => {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [thinkingExpanded, setThinkingExpanded] = useState<ThinkingExpandedMap>({});
  const [fileAttachment, setFileAttachment] = useState<FileAttachment | null>(null);
  
  // RAG file state
  const [ragFiles, setRagFiles] = useState<RAGFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Terms and conditions state
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return localStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
  });
  const [showTerms, setShowTerms] = useState(false);

  // Configure services with the configUrl when component mounts
  useEffect(() => {
    // Set the configUrl for both services
    setRagConfigUrl(configUrl);
    setChatConfigUrl(configUrl);
    // Pass external headers to the chatService so outgoing requests include them
    setExternalHeaders(externalHeaders);
  }, [configUrl]);

  // Keep external headers in sync (allow host to update headers during lifecycle).
  // If the host does not pass `externalHeaders` via props, fall back to a
  // page-level global `window.__LTAI_EXT_HEADERS__` to make dev testing easier
  // (set that global in the console before interacting with the widget).
  useEffect(() => {
    const globalHeaders = (typeof window !== 'undefined' && (window as any).__LTAI_EXT_HEADERS__)
      ? (window as any).__LTAI_EXT_HEADERS__ as Record<string, string>
      : undefined;

    const finalHeaders = externalHeaders ?? globalHeaders;
    setExternalHeaders(finalHeaders);

    try {
      console.log('ChatProvider: external headers source ->', externalHeaders ? 'props' : (globalHeaders ? 'window.__LTAI_EXT_HEADERS__' : 'none'));
      console.log('ChatProvider: external header keys ->', Object.keys(finalHeaders || {}));
    } catch (e) {
      /* ignore logging errors */
    }

    return () => setExternalHeaders(undefined);
  }, [externalHeaders]);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const widgetConfig = await fetchWidgetConfig(configUrl);
        setConfig(widgetConfig);
        // Helpful debug log to confirm the loaded config and branding
        console.log('Loaded widget configuration from', configUrl);
        console.log('Branding:', widgetConfig.branding?.theme, widgetConfig.branding?.logo?.url);
        
        // Set initial states based on config
        if (widgetConfig.widget.behavior.initialState === 'expanded') {
          setIsExpanded(true);
          setIsOpen(true);
        }
        
        // Show terms only if enabled in config and not previously accepted
        setShowTerms(widgetConfig.widget.terms?.enabled !== false && !termsAccepted);
        
        // Clear any existing RAG files if file upload is disabled
        if (widgetConfig.features.fileUpload?.enabled === false) {
          setRagFiles([]);
          setFileAttachment(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
        console.error('Failed to load widget configuration:', err);
      }
    };

    loadConfig();
  }, [configUrl, termsAccepted]);

  const { messages, isLoading, sendMessage, clearMessages, abortStreaming, retryLastMessage } = useChat({
    apiKey,
    welcomeMessage: config?.branding.poweredBy.text || welcomeMessage,
    // Use the host + completions path instead of endpoint
    endpoint: config?.security.api.host ? `${config.security.api.host}/api/openai/api/chat/completions` : undefined,
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
      // set it to collapsed by default (changed from expanded to collapsed)
      if (msg.role === 'assistant' && 
          msg.content.includes('<think>') && 
          thinkingExpanded[index] === undefined) {
        newThinkingExpanded[index] = false; // Set to false (collapsed) instead of true
        updated = true;
      }
    });
    
    if (updated) {
      setThinkingExpanded(newThinkingExpanded);
    }
  }, [messages, thinkingExpanded]);

  const handleSend = (message: string, fileAttachment?: FileAttachment) => {
    if ((message.trim() || ragFiles.length > 0) && termsAccepted) {
      console.log('ChatContext: Sending message:', message);
      console.log('ChatContext: With RAG files:', ragFiles);
      
      // Send message with both file attachment and RAG files
      sendMessage(message, fileAttachment, ragFiles.length > 0 ? ragFiles : undefined);
      
      setInputValue('');
      setFileAttachment(null);
      
      // Clear RAG files after sending
      setRagFiles([]);
      
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
  const acceptTerms = async () => {
    try {
      await recordTermsAcceptance(apiKey); // Use apiKey as configId
      setTermsAccepted(true);
      setShowTerms(false);
      // Save to localStorage so user doesn't have to accept again
      localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    } catch (error) {
      console.error('Error in acceptTerms:', error);
      // Still allow the user to proceed even if the API call fails
      setTermsAccepted(true);
      setShowTerms(false);
      localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
    }
  };

  const declineTerms = () => {
    setIsOpen(false);
  };

  // RAG file management functions
  const addRagFile = (file: RAGFile) => {
    setRagFiles(prev => [...prev, file]);
    setUploadError(null);
  };

  const removeRagFile = (fileId: string) => {
    setRagFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const brandingTheme = config?.branding.theme;
  const brandingIcons = config?.branding.icons;

  const baseTheme: ChatTheme = {
    primary: brandingTheme?.primaryColor || primaryColor,
    secondary: brandingTheme?.secondaryColor || secondaryColor,
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#71717a',
    border: '#e5e7eb',
    icons: {
      primary: brandingIcons?.primary || brandingTheme?.primaryColor || primaryColor,
      secondary: brandingIcons?.secondary || brandingTheme?.secondaryColor || secondaryColor,
      neutral: brandingIcons?.neutral || '#4b5563',
      destructive: brandingIcons?.destructive || '#dc2626',
      toggle: brandingIcons?.toggle || brandingTheme?.secondaryColor || secondaryColor,
    }
  };

  const theme: ChatTheme = {
    ...baseTheme,
    ...(themeOverride || {}),
    icons: {
      ...baseTheme.icons,
      ...(themeOverride?.icons || {}),
    },
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
    showTerms,
    fileAttachment,
    setFileAttachment,
    // Add RAG-related fields to the context value
    ragFiles,
    addRagFile,
    removeRagFile,
    uploadError,
    apiKey, // Add apiKey to the value object
    shadowRootRef // Add shadowRootRef to the value object
    , externalHeaders
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