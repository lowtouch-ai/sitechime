import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import type { ChatTheme } from '../types';

interface ChatInputProps {
  theme: ChatTheme;
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  theme,
  inputValue,
  isLoading,
  onInputChange,
  onSend,
  onKeyPress,
}) => (
  <div className="chat-input-container" style={{
    borderTop: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
    minHeight: '76px',
    flexShrink: 0,
  }}>
    <textarea
      className="chat-input"
      placeholder="Type a message..."
      value={inputValue}
      onChange={(e) => onInputChange(e.target.value)}
      onKeyDown={onKeyPress}
      rows={1}
      style={{
        backgroundColor: theme.background,
        color: theme.text,
        borderColor: theme.border,
      }}
    />
    <button
      className="chat-send-button"
      onClick={onSend}
      disabled={!inputValue.trim() || isLoading}
      style={{
        backgroundColor: theme.primary,
        color: theme.secondary,
        opacity: (!inputValue.trim() || isLoading) ? 0.5 : 1,
      }}
    >
      <PaperAirplaneIcon className="w-5 h-5" />
    </button>
  </div>
);
