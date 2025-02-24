import { useState, useCallback, useEffect } from 'react';
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

export const useChat = ({ 
  apiKey, 
  welcomeMessage,
  endpoint,
  timeoutMs = 30000,
  maxRetries = 3
}: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with welcome message
  useEffect(() => {
    if (welcomeMessage && messages.length === 0) {
      setMessages([{ role: 'assistant', content: welcomeMessage }]);
    }
  }, [welcomeMessage]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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
        }
      );

      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          return prev;
        }
        return [...prev, { role: 'assistant', content: response }];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'I apologize, but I encountered an error processing your request. Please try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, apiKey, endpoint, timeoutMs, maxRetries]);

  const clearMessages = useCallback(() => {
    setMessages(welcomeMessage ? [{ role: 'assistant', content: welcomeMessage }] : []);
  }, [welcomeMessage]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
