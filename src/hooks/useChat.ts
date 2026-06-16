import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/chatService';
import { Message, FileAttachment, RAGFile } from '../types/chat';
import { Logger } from '../utils/logger';

interface UseChatProps {
  apiKey: string;
  welcomeMessage: string;
  endpoint?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

// Generate a unique ID for messages
const generateId = () => Math.random().toString(36).substring(2, 9);


export const useChat = ({ 
  apiKey, 
  welcomeMessage,
  endpoint,
  timeoutMs = 30000,
  maxRetries = 3
}: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Keep a ref to the current messages to avoid dependency issues
  const messagesRef = useRef<Message[]>([]);
  
  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages;
    Logger.log('Messages state updated:', messages);
  }, [messages]);

  // Initialize with welcome message and test thinking message
  // useEffect(() => {
  //   if (messages.length === 0) {
  //     console.log('Initializing chat with welcome message');
  //     const initialMessages = [
  //       { role: 'assistant', content: welcomeMessage, id: generateId() },
  //       // Add an example message with thinking content for testing
  //       { role: 'user', content: 'Can you help me solve this problem?', id: generateId() },
  //       { role: 'assistant', content: EXAMPLE_THINKING_MESSAGE, id: generateId() }
  //     ];
  //     setMessages(initialMessages);
  //   }
  // }, [welcomeMessage]);

  // Decode JWT exp claim without verifying signature to detect expiry before the round-trip.
  const _isJwtExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    } catch {
      return false;
    }
  };

  const sendMessage = useCallback(async (content: string, fileAttachment?: FileAttachment, ragFiles?: RAGFile[]) => {
    Logger.log('sendMessage called with content:', content);
    Logger.log('RAG files:', ragFiles);

    // Proactively detect an expired token before sending — avoids a full round-trip
    // that would just return 401. We only decode the exp claim (no signature check).
    const windowHeaders = typeof window !== 'undefined'
      ? (window as any).__LTAI_EXT_HEADERS__ as Record<string, string> | undefined
      : undefined;
    const apiToken = windowHeaders?.['X-LTAI-EXT-API-TOKEN'];
    if (apiToken && _isJwtExpired(apiToken)) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content, id: generateId(), fileAttachment, ragFiles },
        {
          role: 'assistant',
          content: 'Your session has expired. Please log out and log back in, then try again.',
          id: generateId(),
          isAuthError: true,
        },
      ]);
      return;
    }
    
    const userMessage: Message = { 
      role: 'user', 
      content, 
      id: generateId(),
      fileAttachment,
      ragFiles
    };
    Logger.log('Adding user message:', userMessage);
    
    // First update: Add user message
    setMessages(prev => {
      const updatedMessages = [...prev, userMessage];
      Logger.log('Added user message, new messages state:', updatedMessages);
      return updatedMessages;
    });
    
    setIsLoading(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    // Second update: Add empty assistant message that will be updated with streaming content
    Logger.log('Adding empty assistant message for streaming');
    const assistantMessageId = generateId();
    let currentMessages: Message[] = [];
    
    setMessages(prev => {
      const updatedMessages: Message[] = [...prev, { role: 'assistant', content: '', id: assistantMessageId }];
      Logger.log('Added empty assistant message, new messages state:', updatedMessages);
      currentMessages = [...updatedMessages];
      return updatedMessages;
    });

    try {
      // Wait for state to be updated before proceeding
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Prepare chat messages for API, including file content if available
      const apiMessages = currentMessages.slice(0, -1).map(({role, content}) => {
        // If this is a user message with a file attachment, include the file content
        // if (role === 'user' && fileAttachment) {
        //   return {
        //     role,
        //     content: `${content}\n\nFile attached: ${fileAttachment.name}\n\nFile content: ${fileAttachment.content}`
        //   };
        // }
        return {role, content};
      });
      
      Logger.log('Sending messages to API:', apiMessages);
      
      // Use the most up-to-date messages when making the API call
      await sendChatMessage(
        apiMessages,
        apiKey,
        (chunk: string) => {
          Logger.log('Received chunk in useChat:', chunk);
          // Update the last message (which is the assistant's response) with the new chunk
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessageIndex = newMessages.length - 1;
            if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
              const updatedContent = newMessages[lastMessageIndex].content + chunk;
              Logger.log('Updating assistant message content:', updatedContent);
              // Create a completely new message object to ensure React detects the change
              newMessages[lastMessageIndex] = {
                ...newMessages[lastMessageIndex],
                content: updatedContent,
                // Keep the same ID but force a re-render
                id: assistantMessageId
              };
            } else {
              Logger.warn('Could not find assistant message to update');
            }
            return [...newMessages]; // Return a new array reference
          });
        },
        {
          endpoint,
          timeoutMs,
          maxRetries,
          signal: abortControllerRef.current.signal,
          ragFiles
        }
      );
      
      // Debug: Log final state of messages after streaming is complete
      Logger.log('API call completed, final messages state:', messagesRef.current);
      
    } catch (err) {
      Logger.error('Error in sendMessage:', err);
      const error = err as Error;
      if (error.name !== 'AbortError') {
        Logger.error('Error sending message:', error);
        const isAuthError = (error as any).statusCode === 401;
        setMessages(prev => {
          // Replace the empty assistant message with an error message
          const newMessages = [...prev];
          const lastMessageIndex = newMessages.length - 1;
          const errorMessage: Message = {
            role: 'assistant',
            content: isAuthError
              ? 'Your session is not authorized. Please log out and log back in, then try again.'
              : 'I apologize, but I encountered an error processing your request. Please try again.',
            id: generateId(),
            isAuthError,
          };
          
          if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant' && 
              newMessages[lastMessageIndex].content === '') {
            newMessages[lastMessageIndex] = errorMessage;
          } else {
            newMessages.push(errorMessage);
          }
          Logger.log('Error occurred, updated messages:', newMessages);
          return newMessages;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiKey, endpoint, timeoutMs, maxRetries]);  // Removed messages from dependency array

  // Retry the last user message by removing the last assistant message and resending the last user message
  const retryLastMessage = useCallback(() => {
    if (isLoading) {
      // If currently streaming, abort first
      abortStreaming();
    }

    // Get current messages
    const currentMessages = [...messagesRef.current];
    
    // Find the last user and assistant message pair
    let lastUserMessageIndex = -1;
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }
    
    if (lastUserMessageIndex >= 0) {
      const lastUserMessage = currentMessages[lastUserMessageIndex];
      
      // Remove assistant's response (should be right after the user message)
      if (lastUserMessageIndex < currentMessages.length - 1 && 
          currentMessages[lastUserMessageIndex + 1].role === 'assistant') {
        Logger.log('Retrying last message: Removing assistant response');
        // Remove the assistant's response
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages.splice(lastUserMessageIndex + 1, 1);
          return newMessages;
        });
      }
      
      // Resend the last user message with its file attachment and RAG files if any
      Logger.log('Retrying last message:', lastUserMessage.content);
      sendMessage(
        lastUserMessage.content, 
        lastUserMessage.fileAttachment, 
        lastUserMessage.ragFiles
      );
    } else {
      Logger.warn('No user message found to retry');
    }
  }, [sendMessage, isLoading]);

  const clearMessages = useCallback(() => {
    // Abort any ongoing streaming response
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages(welcomeMessage ? [{ role: 'assistant', content: welcomeMessage, id: generateId() }] : []);
  }, [welcomeMessage]);

  const abortStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    abortStreaming,
    retryLastMessage,
  };
};
