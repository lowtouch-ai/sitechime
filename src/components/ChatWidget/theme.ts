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
  // Convert primary color to CSS variables for chatscope
  document.documentElement.style.setProperty('--cs-theme-primary', primaryColor);
  document.documentElement.style.setProperty('--cs-theme-secondary', secondaryColor);
  document.documentElement.style.setProperty('--cs-theme-background', '#ffffff');
  document.documentElement.style.setProperty('--cs-theme-background-secondary', '#f4f4f5');
  document.documentElement.style.setProperty('--cs-theme-text', '#18181b');
  document.documentElement.style.setProperty('--cs-theme-text-secondary', '#71717a');
  document.documentElement.style.setProperty('--cs-theme-border', '#e4e4e7');

  return {
    primary: primaryColor,
    secondary: secondaryColor,
    background: '#ffffff',
    surface: '#f4f4f5',
    text: '#18181b',
    textSecondary: '#71717a',
    border: '#e4e4e7'
  };
};
