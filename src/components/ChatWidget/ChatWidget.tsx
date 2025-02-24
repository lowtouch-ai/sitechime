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
  TypingIndicator,
  MessageSeparator,
} from '@chatscope/chat-ui-kit-react';

interface ChatWidgetProps {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  welcomeMessage?: string;
  botName?: string;
  botAvatarUrl?: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiKey,
  position = 'bottom-right',
  primaryColor = '#0066cc',
  welcomeMessage = 'Hello! How can I help you today?',
  botName = 'AI Assistant',
  botAvatarUrl = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = generateTheme(primaryColor);
  
  const { messages, isLoading, sendMessage } = useChat({
    apiKey,
    welcomeMessage,
  });

  const handleSend = async (message: string) => {
    await sendMessage(message);
  };

  // Get current date for the message separator
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
          className={clsx(
            "absolute transition-all duration-300 ease-in-out",
            "rounded-lg shadow-2xl overflow-hidden",
            isExpanded ? "w-[800px] h-[80vh]" : "w-96 h-[500px]",
            position === 'bottom-right' ? 'right-0' : 'left-0',
            "bottom-16"
          )}
          style={{ 
            backgroundColor: theme.background,
            boxShadow: `0 8px 32px ${theme.primaryLight}40`,
          }}
        >
          <MainContainer responsive>
            <ChatContainer>
              <ConversationHeader>
                <ConversationHeader.Back />
                <Avatar src={botAvatarUrl || `https://api.dicebear.com/6.x/bottts/svg?seed=${botName}`} name={botName} />
                <ConversationHeader.Content 
                  userName={botName}
                  info="Always here to help"
                />
                <ConversationHeader.Actions>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isExpanded ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 9l6 6m0-6l-6 6m12-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      )}
                    </svg>
                  </button>
                </ConversationHeader.Actions>
              </ConversationHeader>
              <MessageList typingIndicator={isLoading ? <TypingIndicator content="AI is thinking" /> : null}>
                <MessageSeparator content={today} />
                {messages.map((msg, index) => (
                  <Message
                    key={index}
                    model={{
                      message: msg.content,
                      sentTime: "now",
                      sender: msg.role === 'user' ? "You" : botName,
                      direction: msg.role === 'user' ? "outgoing" : "incoming",
                      position: "single",
                    }}
                  >
                    {msg.role !== 'user' && (
                      <Message.Header sender={botName} />
                    )}
                    <Message.CustomContent>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </Message.CustomContent>
                  </Message>
                ))}
              </MessageList>
              <MessageInput
                placeholder="Type your message here..."
                onSend={handleSend}
                disabled={isLoading}
                attachButton={false}
                autoFocus
                style={{
                  boxShadow: '0 -1px 4px rgba(0,0,0,0.05)',
                }}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      )}
    </div>
  );
};
