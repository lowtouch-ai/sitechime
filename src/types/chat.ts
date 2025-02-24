export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatWidgetProps {
  apiKey: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  welcomeMessage?: string;
  botName?: string;
  botAvatarUrl?: string;
}

export interface ChatHeaderProps {
  botName: string;
  botAvatarUrl: string;
  onClose: () => void;
  onNewChat: () => void;
  isExpanded: boolean;
  onExpand: () => void;
}

export interface ChatButtonProps {
  onClick: () => void;
  style: React.CSSProperties;
}

export interface ChatContainerProps {
  children: React.ReactNode;
  customStyles: {
    container: React.CSSProperties;
    messageInput: React.CSSProperties;
  };
}
