import clsx from 'clsx';
import type { Message } from '../../../types/chat';
import type { MessageStyleProps } from '../types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messageStyle: MessageStyleProps;
  messagesRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading,
  messageStyle,
  messagesRef,
}) => (
  <div className="chat-messages" ref={messagesRef} style={{
    flex: '1 1 auto',
    overflowY: 'auto',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
  }}>
    {messages.map((message, index) => (
      <div
        key={index}
        className={clsx(
          'chat-message',
          message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'
        )}
        style={message.role === 'user' ? messageStyle.userMessage : messageStyle.botMessage}
      >
        {message.content}
      </div>
    ))}
    {isLoading && (
      <div className="chat-message chat-message-bot typing-indicator">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    )}
  </div>
);
