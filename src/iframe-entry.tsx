import { createRoot } from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget/ChatWidget';
import { ChatWidgetConfig } from './components/ChatWidget/mount';
import './index.css';
import './components/ChatWidget/ChatWidget.css';
import { setConfigUrl as setChatConfigUrl } from './services/chatService';
import { setConfigUrl as setRagConfigUrl } from './services/ragService';

// Declare the initializeChatWidget function on the window object
declare global {
  interface Window {
    initializeChatWidget: (config: ChatWidgetConfig) => void;
  }
}

// Function to initialize the chat widget inside the iframe
window.initializeChatWidget = (config: ChatWidgetConfig) => {
  const container = document.getElementById('chat-widget-container');
  if (!container) {
    console.error('Chat widget container not found in iframe');
    return;
  }

  // Set the config URL for services
  if (config.configUrl) {
    console.log('Setting config URL in iframe:', config.configUrl);
    setChatConfigUrl(config.configUrl);
    setRagConfigUrl(config.configUrl);
  }

  // Create a root and render the chat widget
  const root = createRoot(container);
  
  // Render the chat widget with the provided config
  root.render(<ChatWidget {...config} />);
  
  // Set up a listener to communicate with the parent window
  const messageParent = (type: string, data: Record<string, unknown>) => {
    window.parent.postMessage({ type, ...data }, '*');
  };
  
  // Create a MutationObserver to watch for changes to the chat window visibility
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && 
          mutation.attributeName === 'class' && 
          mutation.target instanceof HTMLElement) {
        
        const element = mutation.target as HTMLElement;
        const isOpen = element.classList.contains('visible');
        
        // Notify the parent window about the widget state change
        messageParent('WIDGET_STATE_CHANGE', { isOpen });
      }
    });
  });
  
  // Listen for messages from the parent window
  window.addEventListener('message', (event) => {
    // Make sure the message is from our parent
    if (event.source === window.parent) {
      // Handle widget config data
      if (event.data.type === 'WIDGET_CONFIG_DATA' && event.data.widgetConfig) {
        console.log('Received widget config data in iframe:', event.data.widgetConfig);
        
        // Apply the widget configuration to the services
        if (event.data.widgetConfig.security && event.data.widgetConfig.security.api) {
          console.log('Applying API host from widget config:', event.data.widgetConfig.security.api.host);
          
          // We don't need to re-render the widget, just update the services
          // that will be used for API calls
        }
      }
    }
  });
  
  // Start observing the chat window element once it's available
  setTimeout(() => {
    const chatWindow = document.querySelector('.chat-window');
    if (chatWindow) {
      observer.observe(chatWindow, { attributes: true });
    }
  }, 500);
  
  return {
    unmount: () => {
      observer.disconnect();
      root.unmount();
    }
  };
};
