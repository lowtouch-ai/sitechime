import { XMarkIcon, ArrowsPointingOutIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { ChatTheme } from '../types';

interface ChatHeaderProps {
  theme: ChatTheme;
  botName: string;
  logoUrl?: string;
  onClose: () => void;
  onExpand: () => void;
  onClear: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  theme,
  botName,
  logoUrl,
  onClose,
  onExpand,
  onClear,
}) => (
  <div className="chat-header" style={{
    backgroundColor: theme.surface,
    borderBottom: `1px solid ${theme.border}`,
    color: theme.text,
    minHeight: '60px',
    flexShrink: 0,
  }}>
    <div className="chat-header-left">
      {logoUrl ? (
        <img 
          src={logoUrl}
          alt={botName}
          className="chat-avatar"
          style={{ width: '32px', height: '32px' }}
        />
      ) : (
        <div className="chat-avatar-placeholder">
          {botName.charAt(0)}
        </div>
      )}
      <span className="chat-bot-name">{botName}</span>
    </div>
    <div className="chat-header-actions">
      <button onClick={onClear} className="header-button" title="New Chat">
        <PlusIcon className="w-5 h-5" />
      </button>
      <button onClick={onExpand} className="header-button" title="Toggle Fullscreen">
        <ArrowsPointingOutIcon className="w-5 h-5" />
      </button>
      <button onClick={onClose} className="header-button" title="Close">
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  </div>
);
