export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export const generateTheme = (primaryColor: string, secondaryColor: string = '#ffffff'): ThemeColors => {
  return {
    primary: primaryColor,
    primaryDark: primaryColor,
    primaryLight: primaryColor,
    secondary: secondaryColor,
    background: secondaryColor,
    surface: secondaryColor,
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };
};
