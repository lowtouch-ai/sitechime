export interface ChatTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export const generateTheme = (primaryColor: string, secondaryColor: string): ChatTheme => {
  // Create a complete theme object with consistent styling
  return {
    primary: primaryColor,
    secondary: secondaryColor,
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#71717a',
    border: '#e5e7eb'
  };
};
