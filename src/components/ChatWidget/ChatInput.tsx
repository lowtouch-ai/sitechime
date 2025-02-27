import React, { useRef, KeyboardEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useChatContext } from './ChatContext';

export const ChatInput: React.FC = () => {
  const { sendMessage, inputValue, setInputValue, theme } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="border-t p-4" style={{ borderColor: theme.border }}>
      <div className="relative flex items-center">
        <textarea
          ref={textareaRef}
          className="flex-1 resize-none overflow-hidden rounded-2xl border px-4 py-3 pr-12 focus:outline-none focus:ring-2"
          style={{ 
            borderColor: theme.border,
            minHeight: '44px',
            maxHeight: '150px',
            backgroundColor: theme.surface,
            color: theme.text,
            outlineColor: theme.primary
          }}
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onInput={handleTextareaInput}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="absolute right-2 p-2 rounded-full disabled:opacity-40"
          style={{ 
            backgroundColor: inputValue.trim() ? theme.primary : 'transparent',
            color: inputValue.trim() ? theme.secondary : theme.text
          }}
          onClick={handleSend}
          disabled={!inputValue.trim()}
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};