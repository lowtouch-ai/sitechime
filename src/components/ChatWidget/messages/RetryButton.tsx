import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { ChatTheme } from '../types';

interface RetryButtonProps {
  onRetry: () => void;
  theme: ChatTheme;
}

export const RetryButton: React.FC<RetryButtonProps> = ({ onRetry, theme }) => (
  <div className="flex justify-center my-1">
    <button 
      onClick={onRetry}
      className="retry-button flex items-center justify-center py-1 px-2.5 text-[10px] font-medium rounded-lg border transition-all glass-effect hover:scale-105 active:scale-95 shadow-sm"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        color: theme.text,
        opacity: 0.9
      }}
      aria-label="Retry last message"
      title="Retry last message"
      data-testid="retry-button"
    >
      <ArrowPathIcon className="w-3 h-3 mr-1.5" />
      <span>Retry last message</span>
    </button>
  </div>
);