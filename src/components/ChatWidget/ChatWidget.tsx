import { useState, useEffect, useRef } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { generateTheme } from './theme';

interface ChatWidgetProps {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  welcomeMessage?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiKey,
  position = 'bottom-right',
  primaryColor = '#0066cc',
  welcomeMessage = 'Hello! How can I help you today?',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = generateTheme(primaryColor);
  
  const { messages, isLoading, sendMessage } = useChat({
    apiKey,
    welcomeMessage,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className={clsx(
      'fixed z-50',
      position === 'bottom-right' ? 'right-4' : 'left-4',
      'bottom-4'
    )}>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'rounded-full p-4 shadow-lg transition-all duration-300',
          'hover:shadow-xl transform hover:scale-105',
          isOpen ? 'bg-gray-600 rotate-90' : 'bg-primary'
        )}
        style={{ 
          backgroundColor: isOpen ? theme.primaryDark : theme.primary,
          boxShadow: `0 4px 12px ${theme.primaryLight}40`
        }}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-white" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-96 h-[500px] rounded-lg shadow-2xl flex flex-col overflow-hidden"
          style={{ 
            backgroundColor: theme.background,
            boxShadow: `0 8px 32px ${theme.primaryLight}40`,
          }}
        >
          {/* Header */}
          <div 
            className="px-4 py-3 flex items-center"
            style={{ 
              backgroundColor: theme.primary,
              color: theme.background
            }}
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            <span className="font-medium">Chat Assistant</span>
          </div>

          {/* Messages Container */}
          <div 
            className="flex-1 p-4 overflow-y-auto"
            style={{ backgroundColor: theme.background }}
          >
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                theme={theme}
              />
            ))}
            {isLoading && (
              <div className="flex justify-center py-2">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: theme.primary,
                        animation: 'bounce 1.4s infinite ease-in-out',
                        animationDelay: `${i * 0.16}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSubmit} 
            className="p-4 border-t"
            style={{ borderColor: theme.border }}
          >
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className={clsx(
                  "w-full p-3 pr-12 rounded-full",
                  "border focus:outline-none focus:ring-2 focus:ring-opacity-50",
                  "transition-all duration-200"
                )}
                style={{ 
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  color: theme.text,
                  '--tw-ring-color': `${theme.primaryLight}`,
                } as any}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={clsx(
                  "absolute right-2 top-1/2 transform -translate-y-1/2",
                  "p-2 rounded-full transition-all duration-200",
                  "hover:bg-primary hover:text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                style={{ 
                  color: input.trim() ? theme.primary : theme.textSecondary
                }}
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
