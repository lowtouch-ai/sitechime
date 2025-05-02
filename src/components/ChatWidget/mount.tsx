import { createRoot } from 'react-dom/client';
import { ChatWidget } from './ChatWidget';
import '../../../src/index.css';
import './ChatWidget.css';

export interface ChatWidgetConfig {
  apiKey: string;
  theme?: {
    primary: string;
    secondary: string;
    text: string;
    surface: string;
    border: string;
  };
  position?: 'bottom-right' | 'bottom-left';
  configUrl: string;
}

export function mountChatWidget(containerId: string, config: ChatWidgetConfig) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  const root = createRoot(container);
  root.render(<ChatWidget {...config} />);
  
  return {
    unmount: () => root.unmount()
  };
}