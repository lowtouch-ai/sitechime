export interface ChatWidgetProps {
  apiKey: string;
  configUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: {
    primary: string;
    secondary: string;
    text: string;
    surface: string;
    border: string;
  };
  welcomeMessage?: string;
}
