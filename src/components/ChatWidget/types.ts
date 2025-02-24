import type { WidgetConfig } from '../../types/widgetConfig';

export interface ChatWidgetProps {
  apiKey: string;
  configUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  secondaryColor?: string;
  welcomeMessage?: string;
  botName?: string;
  botAvatarUrl?: string;
}

export interface ChatTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface MessageStyleProps {
  userMessage: {
    backgroundColor: string;
    color: string;
  };
  botMessage: {
    backgroundColor: string;
    color: string;
  };
}
