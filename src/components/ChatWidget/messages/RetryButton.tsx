import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { ChatTheme } from '../types';

interface RetryButtonProps {
  onRetry: () => void;
  theme: ChatTheme;
}

export const RetryButton: React.FC<RetryButtonProps> = ({ onRetry, theme }) => (
  <div className="flex justify-center">
    <button 
      onClick={onRetry}
      className="retry-button flex items-center justify-center py-1 px-3 text-xs rounded-full border hover:bg-gray-100 transition-colors bg-white"
      style={{
        borderColor: theme.border,
        color: theme.text
      }}
      aria-label="Retry last message"
      title="Retry last message"
      data-testid="retry-button"
    >
      <ArrowPathIcon className="w-3 h-3 mr-1" />
      <span>Retry last message</span>
    </button>
  </div>
);