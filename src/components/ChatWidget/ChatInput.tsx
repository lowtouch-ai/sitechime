import React, { useRef, KeyboardEvent } from 'react';
import { PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useChatContext } from './ChatContext';

export const ChatInput: React.FC = () => {
  const { 
    sendMessage, 
    inputValue, 
    setInputValue, 
    theme, 
    isLoading, 
    abortStreaming,
    termsAccepted,
    showTerms
  } = useChatContext();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (isLoading) {
      abortStreaming(); // Just abort the stream without clearing messages
      return;
    }

    if (inputValue.trim() && termsAccepted) {
      sendMessage(inputValue);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && termsAccepted) {
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

  // Determine if input should be disabled
  const isInputDisabled = isLoading || showTerms;
  
  // Message to show in the placeholder depending on terms acceptance
  const placeholderText = !termsAccepted && showTerms 
    ? "Please accept terms and conditions to chat..." 
    : "Type your message...";

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
            outlineColor: theme.primary,
            opacity: isInputDisabled ? 0.6 : 1
          }}
          placeholder={placeholderText}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onInput={handleTextareaInput}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isInputDisabled}
        />
        <button
          className="absolute right-2 p-2 rounded-full hover:opacity-80 transition-all"
          style={{ 
            backgroundColor: (isLoading || (inputValue.trim() && termsAccepted)) ? theme.primary : 'transparent',
            color: (isLoading || (inputValue.trim() && termsAccepted)) ? theme.secondary : theme.text,
            opacity: isInputDisabled ? 0.6 : 1
          }}
          onClick={handleSend}
          aria-label={isLoading ? "Stop generating" : "Send message"}
          disabled={isInputDisabled && !isLoading}
        >
          {isLoading ? (
            <StopIcon className="h-5 w-5" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};