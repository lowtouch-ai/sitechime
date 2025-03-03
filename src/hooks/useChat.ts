import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/chatService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatProps {
  apiKey: string;
  welcomeMessage: string;
  endpoint?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

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

  // Initialize with welcome message and test thinking message
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessages = [
        { role: 'assistant', content: welcomeMessage },
        // Add an example message with thinking content for testing
        { role: 'user', content: 'Can you help me solve this problem?' },
        { role: 'assistant', content: EXAMPLE_THINKING_MESSAGE }
      ];
      setMessages(initialMessages);
    }
  }, [welcomeMessage]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await sendChatMessage(
        messages.concat(userMessage),
        apiKey,
        (chunk: string) => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + chunk }
              ];
            }
            return [...prev, { role: 'assistant', content: chunk }];
          });
        },
        {
          endpoint,
          timeoutMs,
          maxRetries,
          signal: abortControllerRef.current.signal,
        }
      );

      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          return prev;
        }
        return [...prev, { role: 'assistant', content: response }];
      });
    } catch (err) {
      const error = err as Error;
      if (error.name !== 'AbortError') {
        console.error('Error sending message:', error);
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: 'I apologize, but I encountered an error processing your request. Please try again.'
          }
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, apiKey, endpoint, timeoutMs, maxRetries]);

  const clearMessages = useCallback(() => {
    // Abort any ongoing streaming response
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setMessages(welcomeMessage ? [{ role: 'assistant', content: welcomeMessage }] : []);
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
