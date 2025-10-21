export interface ChatTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  icons: {
    primary: string;
    secondary: string;
    neutral: string;
    destructive: string;
    toggle: string;
  };
}

export const generateTheme = (
  primaryColor: string,
  secondaryColor: string,
  iconOverrides?: Partial<ChatTheme['icons']>
): ChatTheme => {
  // Create a complete theme object with consistent styling
  return {
    primary: primaryColor,
    secondary: secondaryColor,
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#71717a',
    border: '#e5e7eb',
    icons: {
      primary: iconOverrides?.primary ?? primaryColor,
      secondary: iconOverrides?.secondary ?? secondaryColor,
      neutral: iconOverrides?.neutral ?? '#4b5563',
      destructive: iconOverrides?.destructive ?? '#dc2626',
      toggle: iconOverrides?.toggle ?? secondaryColor
    }
  };
};
