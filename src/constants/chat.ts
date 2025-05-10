export const CHAT_DEFAULTS = {
  POSITION: 'bottom-right' as const,
  PRIMARY_COLOR: '#404040',
  WELCOME_MESSAGE: 'Hello! How can I help you today?',
  BOT_NAME: 'AI Assistant',
  BOT_AVATAR_URL: '',
};

export const STORAGE_KEYS = {
  CHAT_MESSAGES: 'chat-messages',
};

export const STYLE_VARIABLES = {
  messageInput: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e5e5',
    borderRadius: '12px',
    padding: '14px',
    fontSize: '15px',
    minHeight: '44px',
  },
  container: {
    borderRadius: '16px',
    messagePadding: '1rem',
    avatarBorderRadius: '50%',
    messageBubble: {
      borderRadius: '14px',
      fontSize: '15px',
      lineHeight: '1.4',
      padding: {
        top: '8px',
        bottom: '8px',
        left: '12px',
        right: '12px',
      },
    },
  },
};
