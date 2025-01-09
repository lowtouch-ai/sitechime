export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export const generateTheme = (primaryColor: string): ThemeColors => {
  // Convert primary color to HSL for easier manipulation
  const primaryHex = primaryColor.replace('#', '');
  const r = parseInt(primaryHex.substr(0, 2), 16) / 255;
  const g = parseInt(primaryHex.substr(2, 2), 16) / 255;
  const b = parseInt(primaryHex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else if (max === b) h = (r - g) / d + 4;
    
    h /= 6;
  }

  // Convert HSL back to hex
  const toHex = (hue: number, sat: number, light: number): string => {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;

    const r = Math.round(hue2rgb(p, q, hue + 1/3) * 255);
    const g = Math.round(hue2rgb(p, q, hue) * 255);
    const b = Math.round(hue2rgb(p, q, hue - 1/3) * 255);

    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  return {
    primary: primaryColor,
    primaryDark: toHex(h, s, l * 0.8),
    primaryLight: toHex(h, s * 0.8, l + (1 - l) * 0.2),
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e2e8f0',
  };
};
