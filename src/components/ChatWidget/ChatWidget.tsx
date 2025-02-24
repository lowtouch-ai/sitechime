import { useState, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
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
  primaryColor = '#404040', // Dark gray
  welcomeMessage = 'Hello! How can I help you today?',
  botName = 'AI Assistant',
  botAvatarUrl = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = generateTheme(primaryColor);
  
  const { messages, isLoading, sendMessage, clearMessages } = useChat({
    apiKey,
    welcomeMessage,
  });

  const handleSend = async (message: string) => {
    await sendMessage(message);
  };

  const handleNewChat = () => {
    clearMessages();
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Custom styles for grayscale design
  const customStyles = {
    container: {
      '--cs-message-input-bg-color': '#ffffff',
      '--cs-message-input-border-color': '#e5e5e5',
      '--cs-message-input-border-radius': '12px',
      '--cs-main-container-border-radius': '16px',
      '--cs-message-list-padding-top': '1rem',
      '--cs-message-list-padding-bottom': '1rem',
      '--cs-message-input-padding': '14px',
      '--cs-message-input-font-size': '15px',
      '--cs-message-input-min-height': '44px',
      '--cs-avatar-border-radius': '50%',
      '--cs-message-bubble-border-radius': '14px',
      '--cs-message-bubble-font-size': '15px',
      '--cs-message-bubble-line-height': '1.4',
      '--cs-message-bubble-padding-top': '8px',
      '--cs-message-bubble-padding-bottom': '8px',
      '--cs-message-bubble-padding-left': '12px',
      '--cs-message-bubble-padding-right': '12px',
      textAlign: 'left' as const,
    },
    messageInput: {
      boxShadow: '0 -1px 0 rgba(0,0,0,0.1)',
      backgroundColor: '#ffffff',
      padding: '12px 16px',
    },
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
        )}
        style={{ 
          backgroundColor: isOpen ? '#1a1a1a' : '#404040',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
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
            "rounded-2xl shadow-2xl overflow-hidden",
            isExpanded ? "w-[800px] h-[80vh]" : "w-[380px] h-[600px]",
            position === 'bottom-right' ? 'right-0' : 'left-0',
            "bottom-16"
          )}
          style={{ 
            backgroundColor: '#ffffff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          <MainContainer responsive style={customStyles.container}>
            <ChatContainer>
              <ConversationHeader>
                <Avatar 
                  src={botAvatarUrl || `https://api.dicebear.com/6.x/bottts/svg?seed=${botName}`} 
                  name={botName}
                  style={{ width: '34px', height: '34px' }}
                />
                <ConversationHeader.Content 
                  userName={botName}
                  info="Always here to help"
                  style={{ 
                    fontSize: '15px',
                    fontWeight: 500,
                  }}
                />
                <ConversationHeader.Actions>
                  <button
                    onClick={handleNewChat}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-1"
                    title="New Chat"
                  >
                    <PlusIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isExpanded ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 9l6 6m0-6l-6 6m12-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      )}
                    </svg>
                  </button>
                </ConversationHeader.Actions>
              </ConversationHeader>
              <MessageList 
                typingIndicator={isLoading ? <TypingIndicator content="AI is thinking" /> : null}
                style={{ padding: '1rem', backgroundColor: '#f7f7f7' }}
              >
                <MessageSeparator 
                  content={today}
                  style={{
                    color: '#666666',
                    fontSize: '13px',
                    marginBottom: '1rem',
                  }}
                />
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
                    style={{
                      textAlign: 'left',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {msg.role !== 'user' && (
                      <Message.Header 
                        sender={botName}
                        style={{
                          fontSize: '13px',
                          color: '#666666',
                          marginBottom: '4px',
                        }}
                      />
                    )}
                    <Message.CustomContent>
                      <div 
                        className="whitespace-pre-wrap"
                        style={{
                          fontSize: '15px',
                          lineHeight: '1.4',
                          color: msg.role === 'user' ? '#ffffff' : '#1a1a1a',
                          backgroundColor: msg.role === 'user' ? '#404040' : '#f0f0f0',
                          padding: '8px 12px',
                          borderRadius: '14px',
                        }}
                      >
                        {msg.content}
                      </div>
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
                style={customStyles.messageInput}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      )}
    </div>
  );
};
