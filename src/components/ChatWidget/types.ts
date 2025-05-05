export interface ChatTheme {
  primary: string;
  secondary: string;
  text: string;
  surface: string;
  border: string;
}

export interface ChatWidgetProps {
  apiKey: string;
  configUrl: string;
  position?: 'bottom-right' | 'bottom-left';
  theme?: ChatTheme;
  welcomeMessage?: string;
  shadowRootRef?: ShadowRoot | null;
}
