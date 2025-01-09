import { useState, useCallback, useEffect } from 'react';
import { sendChatMessage } from '../services/chatService';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseChatProps {
  apiKey: string;
  welcomeMessage: string;
}

export const useChat = ({ apiKey, welcomeMessage }: UseChatProps) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    return savedMessages 
      ? JSON.parse(savedMessages) 
      : [{ role: 'assistant', content: welcomeMessage }];
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        [...messages, userMessage],
        apiKey
      );
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, apiKey]);

  const clearMessages = useCallback(() => {
    setMessages([{ role: 'assistant', content: welcomeMessage }]);
  }, [welcomeMessage]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
