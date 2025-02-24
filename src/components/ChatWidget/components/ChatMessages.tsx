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
  <div className="chat-messages" ref={messagesRef}>
    {messages.map((message, index) => (
      <div
        key={index}
        className={clsx(
          'chat-message',
          message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'
        )}
        style={{
          ...message.role === 'user' ? messageStyle.userMessage : messageStyle.botMessage,
          whiteSpace: 'pre-wrap'
        }}
      >
        {message.content}
      </div>
    ))}
    {isLoading && (
      <div className="chat-message chat-message-bot typing-indicator">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    )}
  </div>
);
