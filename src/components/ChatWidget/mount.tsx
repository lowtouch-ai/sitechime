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
  
  // Create style element to inject our CSS
  const styleElement = document.createElement('style');
  
  // Import CSS files content at build time
  // This will be replaced with actual CSS content during build
  const cssContent = `
    /* Widget styles will be injected here during build */
    @import url('./ChatWidget.css');
  `;
  
  styleElement.textContent = cssContent;
  shadowRoot.appendChild(styleElement);

  const root = createRoot(shadowContainer);
  root.render(<ChatWidget {...config} />);
  
  return {
    unmount: () => root.unmount()
  };
}