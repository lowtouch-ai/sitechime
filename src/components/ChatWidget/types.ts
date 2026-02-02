export interface ChatTheme {
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  surface: string;
  background: string;
  border: string;
  icons: {
    primary: string;
    secondary: string;
    neutral: string;
    destructive: string;
    toggle: string;
  };
}

export interface ChatWidgetProps {
  apiKey?: string;
  configUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: Partial<ChatTheme>;
  welcomeMessage?: string;
  shadowRootRef?: ShadowRoot | null;
  // Optional external headers passed from the host page for context propagation
  externalHeaders?: Record<string, string>;
}
