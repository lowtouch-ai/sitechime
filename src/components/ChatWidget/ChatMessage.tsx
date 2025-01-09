import { FC } from 'react';
import clsx from 'clsx';
import { Message } from '../../hooks/useChat';
import { ThemeColors } from './theme';

interface ChatMessageProps {
  message: Message;
  theme: ThemeColors;
}

export const ChatMessage: FC<ChatMessageProps> = ({ message, theme }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={clsx(
        'group flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'relative max-w-[80%] px-4 py-3 rounded-2xl',
          'transition-all duration-200',
          isUser
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-surface text-text rounded-tl-sm'
        )}
        style={{
          backgroundColor: isUser ? theme.primary : theme.surface,
          color: isUser ? theme.background : theme.text,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        
        {/* Message Tail */}
        <div
          className={clsx(
            'absolute top-0 w-2 h-2 transform',
            isUser ? '-right-1' : '-left-1'
          )}
          style={{
            backgroundColor: isUser ? theme.primary : theme.surface,
          }}
        />
      </div>
    </div>
  );
};
