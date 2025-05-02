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

  // Create a shadow DOM to isolate our widget from the host page's CSS
  const shadowRoot = container.attachShadow({ mode: 'open' });
  
  // Create a container element inside the shadow DOM
  const shadowContainer = document.createElement('div');
  shadowContainer.id = 'shadow-container';
  shadowRoot.appendChild(shadowContainer);
  
  // We'll load the CSS in the Vite plugin
  
  const root = createRoot(shadowContainer);
  root.render(<ChatWidget {...config} />);
  
  return {
    unmount: () => root.unmount()
  };
}