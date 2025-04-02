import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useChat } from '../../hooks/useChat';
import { fetchWidgetConfig } from '../../services/configService';
import type { WidgetConfig } from '../../types/widgetConfig';
import { FileAttachment, RAGFile } from '../../types/chat';

// Updated Message interface matching useChat.ts
interface Message {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
  fileAttachment?: FileAttachment;
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
  sendMessage: (message: string, fileAttachment?: FileAttachment) => void;
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
  fileAttachment: FileAttachment | null;
  setFileAttachment: (file: FileAttachment | null) => void;
  // New RAG-related fields
  ragFiles: RAGFile[];
  addRagFile: (file: RAGFile) => void;
  removeRagFile: (fileId: string) => void;
  uploadingFile: boolean;
  uploadError: string | null;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

// Local storage key for terms acceptance
const TERMS_ACCEPTED_KEY = 'chat-widget-terms-accepted';

const recordTermsAcceptance = async (configId: string) => {
  try {
    const apiUrl = `${process.env.VITE_TNC_API_URL}/api/tnc/accept/`;
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
  welcomeMessage = 'Hello! How can I help you today?',
  botName = 'AI Assistant',
  botAvatarUrl = '',
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
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Terms and conditions state
  const [termsAccepted, setTermsAccepted] = useState(() => {
    return localStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
  });
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const widgetConfig = await fetchWidgetConfig(configUrl);
        setConfig(widgetConfig);
        
        // Set initial states based on config
        if (widgetConfig.widget.behavior.initialState === 'expanded') {
          setIsExpanded(true);
          setIsOpen(true);
        }
        
        // Show terms only if enabled in config and not previously accepted
        setShowTerms(widgetConfig.widget.terms?.enabled !== false && !termsAccepted);
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
    showTerms,
    fileAttachment,
    setFileAttachment,
    // Add RAG-related fields to the context value
    ragFiles,
    addRagFile,
    removeRagFile,
    uploadingFile,
    uploadError
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