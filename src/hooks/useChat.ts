import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/chatService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  // Add an id to force re-renders when content changes
  id?: string;
}

interface UseChatProps {
  apiKey: string;
  welcomeMessage: string;
  endpoint?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

// Generate a unique ID for messages
const generateId = () => Math.random().toString(36).substring(2, 9);

// FOR TESTING: Add an example message with thinking tokens
const EXAMPLE_THINKING_MESSAGE = `I'll help you solve this problem. <think>
First, let me work through this step by step:
1. We need to identify the core issue
2. Research possible solutions
3. Evaluate the best approach
4. Implement the solution
</think> Based on my analysis, here's what you should do.`;

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
    console.log('Messages state updated:', messages);
  }, [messages]);

  // Initialize with welcome message and test thinking message
  useEffect(() => {
    if (messages.length === 0) {
      console.log('Initializing chat with welcome message');
      const initialMessages = [
        { role: 'assistant', content: welcomeMessage, id: generateId() },
        // Add an example message with thinking content for testing
        { role: 'user', content: 'Can you help me solve this problem?', id: generateId() },
        { role: 'assistant', content: EXAMPLE_THINKING_MESSAGE, id: generateId() }
      ];
      setMessages(initialMessages);
    }
  }, [welcomeMessage]);

  const sendMessage = useCallback(async (content: string) => {
    console.log('sendMessage called with content:', content);
    const userMessage: Message = { role: 'user', content, id: generateId() };
    console.log('Adding user message:', userMessage);
    
    // First update: Add user message
    setMessages(prev => {
      const updatedMessages = [...prev, userMessage];
      console.log('Added user message, new messages state:', updatedMessages);
      return updatedMessages;
    });
    
    setIsLoading(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    // Second update: Add empty assistant message that will be updated with streaming content
    console.log('Adding empty assistant message for streaming');
    const assistantMessageId = generateId();
    let currentMessages: Message[] = [];
    
    setMessages(prev => {
      const updatedMessages = [...prev, { role: 'assistant', content: '', id: assistantMessageId }];
      console.log('Added empty assistant message, new messages state:', updatedMessages);
      currentMessages = [...updatedMessages];
      return updatedMessages;
    });

    try {
      // Wait for state to be updated before proceeding
      await new Promise(resolve => setTimeout(resolve, 0));
      console.log('Sending messages to API:', currentMessages.slice(0, -1));
      
      // Use the most up-to-date messages when making the API call
      await sendChatMessage(
        // Use all messages except the empty one we just added
        currentMessages.slice(0, -1).map(({role, content}) => ({role, content})),
        apiKey,
        (chunk: string) => {
          console.log('Received chunk in useChat:', chunk);
          // Update the last message (which is the assistant's response) with the new chunk
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessageIndex = newMessages.length - 1;
            if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
              const updatedContent = newMessages[lastMessageIndex].content + chunk;
              console.log('Updating assistant message content:', updatedContent);
              // Create a completely new message object to ensure React detects the change
              newMessages[lastMessageIndex] = {
                ...newMessages[lastMessageIndex],
                content: updatedContent,
                // Keep the same ID but force a re-render
                id: assistantMessageId
              };
            } else {
              console.warn('Could not find assistant message to update');
            }
            return [...newMessages]; // Return a new array reference
          });
        },
        {
          endpoint,
          timeoutMs,
          maxRetries,
          signal: abortControllerRef.current.signal,
        }
      );
      
      // Debug: Log final state of messages after streaming is complete
      console.log('API call completed, final messages state:', messagesRef.current);
      
    } catch (err) {
      console.error('Error in sendMessage:', err);
      const error = err as Error;
      if (error.name !== 'AbortError') {
        console.error('Error sending message:', error);
        setMessages(prev => {
          // Replace the empty assistant message with an error message
          const newMessages = [...prev];
          const lastMessageIndex = newMessages.length - 1;
          const errorMessage = {
            role: 'assistant',
            content: 'I apologize, but I encountered an error processing your request. Please try again.',
            id: generateId()
          };
          
          if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant' && 
              newMessages[lastMessageIndex].content === '') {
            newMessages[lastMessageIndex] = errorMessage;
          } else {
            newMessages.push(errorMessage);
          }
          console.log('Error occurred, updated messages:', newMessages);
          return newMessages;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [apiKey, endpoint, timeoutMs, maxRetries]);  // Removed messages from dependency array

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
  };
};
