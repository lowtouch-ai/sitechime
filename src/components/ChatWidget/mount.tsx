import { createRoot } from 'react-dom/client';
import { ChatWidget } from './ChatWidget';
import '../../../src/index.css';
import './ChatWidget.css';
import { mountChatWidgetInIframe } from './iframe-mount';

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
  useIframe?: boolean;
}

// Define a type for the unmount function
type UnmountFunction = () => void;

// Legacy direct mounting method (without iframe)
export function mountChatWidgetDirect(containerId: string, config: ChatWidgetConfig) {
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

// Main mounting function that decides whether to use iframe or direct mounting
export function mountChatWidget(containerId: string, config: ChatWidgetConfig) {
  // Use iframe by default (to prevent CSS leakage), unless explicitly set to false
  const useIframe = config.useIframe !== false;
  
  if (useIframe) {
    // Since mountChatWidgetInIframe is async, we need to handle it differently
    const unmountRef = { current: null as UnmountFunction | null };
    
    // Start the async mounting process
    mountChatWidgetInIframe(containerId, config).then(result => {
      if (result && result.unmount) {
        unmountRef.current = result.unmount;
      }
    }).catch(error => {
      console.error('Error mounting chat widget in iframe:', error);
      // Fallback to direct mounting if iframe mounting fails
      console.log('Falling back to direct mounting...');
      const result = mountChatWidgetDirect(containerId, config);
      if (result && result.unmount) {
        unmountRef.current = result.unmount;
      }
    });
    
    // Return an unmount function that will use the reference once it's available
    return {
      unmount: () => {
        if (unmountRef.current) {
          unmountRef.current();
        }
      }
    };
  } else {
    return mountChatWidgetDirect(containerId, config);
  }
}