import { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useChat } from '../../hooks/useChat';
import { generateTheme } from './theme';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
} from '@chatscope/chat-ui-kit-react';

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
  const theme = generateTheme(primaryColor);
  
  const { messages, isLoading, sendMessage } = useChat({
    apiKey,
    welcomeMessage,
  });

  const handleSend = async (message: string) => {
    await sendMessage(message);
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
          className="absolute bottom-16 right-0 w-96 h-[500px] rounded-lg shadow-2xl overflow-hidden"
          style={{ 
            backgroundColor: theme.background,
            boxShadow: `0 8px 32px ${theme.primaryLight}40`,
          }}
        >
          <MainContainer>
            <ChatContainer>
              <ConversationHeader>
                <Avatar src="" name="AI" />
                <ConversationHeader.Content userName="Chat Assistant" />
              </ConversationHeader>
              <MessageList>
                {messages.map((msg, index) => (
                  <Message
                    key={index}
                    model={{
                      message: msg.content,
                      sentTime: "now",
                      sender: msg.role === 'user' ? "You" : "Assistant",
                      direction: msg.role === 'user' ? "outgoing" : "incoming",
                      position: "single"
                    }}
                  />
                ))}
                {isLoading && (
                  <Message
                    model={{
                      message: "...",
                      sentTime: "now",
                      sender: "Assistant",
                      direction: "incoming",
                      position: "single"
                    }}
                  />
                )}
              </MessageList>
              <MessageInput
                placeholder="Type message here"
                onSend={handleSend}
                disabled={isLoading}
                attachButton={false}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      )}
    </div>
  );
};
