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
