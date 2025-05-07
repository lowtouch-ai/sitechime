import { createRoot } from 'react-dom/client';
import { ChatWidget } from './ChatWidget';
// Remove direct CSS imports since we'll inject them into shadow DOM
// import '../../../src/index.css';
// import './ChatWidget.css';

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

  // Check if Shadow DOM is supported
  const supportsShadowDOM = !!HTMLElement.prototype.attachShadow;
  let shadowRoot: ShadowRoot | null = null;
  let reactWrapper: HTMLElement;

  if (supportsShadowDOM) {
    // Create shadow root
    shadowRoot = container.attachShadow({ mode: 'open' });
    
    // Create wrapper element inside shadow root for React to render into
    reactWrapper = document.createElement('div');
    reactWrapper.id = 'chat-widget-shadow-wrapper';
    shadowRoot.appendChild(reactWrapper);
    
    // Create a link element for the main CSS
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css';
    
    // Create a style element for custom styles
    const customStyles = document.createElement('style');
    
    // Add the essential custom styles directly first as a baseline
    customStyles.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-6px); }
      }
      .chat-window-enter { animation: slideIn 0.3s ease-out forwards; }
      .message-enter { animation: fadeIn 0.3s ease-out forwards; }
      .chat-widget { position: fixed; z-index: 1000; bottom: 20px; display: flex; flex-direction: column; }
      .chat-widget-right { right: 20px; }
      .chat-widget-left { left: 20px; }
      .chat-window { position: fixed; bottom: 80px; right: 20px; min-height: 500px; height: calc(90vh - 100px); width: 400px; display: flex; flex-direction: column; opacity: 0; transform: translateY(20px); transition: opacity 0.3s ease-out, transform 0.3s ease-out; }
      .chat-window.visible { opacity: 1; transform: translateY(0); }
      .chat-window.expanded { width: 100% !important; height: 100vh !important; bottom: 0 !important; right: 0 !important; border-radius: 0 !important; max-width: none !important; }
      .chat-messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
      .chat-message { max-width: 85%; padding: 0.75rem 1rem; border-radius: 1rem; position: relative; user-select: text; }
      .message-user { align-self: flex-end; border-bottom-right-radius: 0.25rem; margin-left: auto; text-align: right; }
      .message-assistant { align-self: flex-start; border-bottom-left-radius: 0.25rem; margin-right: auto; text-align: left; }
      .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 0.5rem; background-color: #f9f9f9; border-radius: 8px; margin-top: 4px; }
      .typing-indicator-dot { width: 5px; height: 5px; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; background-color: #3b82f6; }
      .typing-indicator-dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-indicator-dot:nth-child(2) { animation-delay: -0.16s; }
    `;
    
    // Add the link and style elements to the shadow DOM
    shadowRoot.appendChild(linkElement);
    shadowRoot.appendChild(customStyles);
    
    // Fetch and inject the full ChatWidget.css content
    try {
      // Use a more direct approach to get the CSS file
      const cssPath = new URL('./ChatWidget.css', import.meta.url).href;
      console.log('Attempting to load CSS from:', cssPath);
      
      fetch(cssPath)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load CSS: ${response.status} ${response.statusText}`);
          }
          return response.text();
        })
        .then(cssText => {
          console.log('CSS loaded successfully, length:', cssText.length);
          customStyles.textContent = cssText;
        })
        .catch(error => {
          console.error('Error loading ChatWidget.css:', error);
        });
    } catch (error) {
      console.error('Error setting up CSS fetch:', error);
    }
    
    // Create a separate style element for zoom styles
    const zoomStyles = document.createElement('style');
    
    // Load zoom CSS
    fetch('https://unpkg.com/react-medium-image-zoom@5.1.9/dist/styles.css')
      .then(response => response.text())
      .then(cssText => {
        zoomStyles.textContent = cssText;
        if (shadowRoot) {
          shadowRoot.appendChild(zoomStyles);
          console.log('Successfully loaded zoom styles');
        }
      })
      .catch(error => {
        console.error('Failed to load zoom styles:', error);
      });
  } else {
    // Fallback for browsers that don't support Shadow DOM
    console.warn('Shadow DOM is not supported in this browser. Chat widget styles may be affected by the page styles.');
    
    // Use container directly
    reactWrapper = container;
    
    // Add a unique class to the container for scoping
    container.classList.add('chat-widget-no-shadow');
    
    // Load Tailwind CSS directly in the document head
    const tailwindLink = document.createElement('link');
    tailwindLink.rel = 'stylesheet';
    tailwindLink.href = 'https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css';
    document.head.appendChild(tailwindLink);
    
    // Add custom styles
    const customStylesElement = document.createElement('style');
    customStylesElement.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-6px); }
      }
      .chat-widget-no-shadow .chat-window-enter { animation: slideIn 0.3s ease-out forwards; }
      .chat-widget-no-shadow .message-enter { animation: fadeIn 0.3s ease-out forwards; }
      .chat-widget-no-shadow .chat-widget { position: fixed; z-index: 1000; bottom: 20px; display: flex; flex-direction: column; }
      .chat-widget-no-shadow .chat-widget-right { right: 20px; }
      .chat-widget-no-shadow .chat-widget-left { left: 20px; }
      .chat-widget-no-shadow .chat-window { position: fixed; bottom: 80px; right: 20px; min-height: 500px; height: calc(90vh - 100px); width: 400px; display: flex; flex-direction: column; opacity: 0; transform: translateY(20px); transition: opacity 0.3s ease-out, transform 0.3s ease-out; }
      .chat-widget-no-shadow .chat-window.visible { opacity: 1; transform: translateY(0); }
      .chat-widget-no-shadow .chat-window.expanded { width: 100% !important; height: 100vh !important; bottom: 0 !important; right: 0 !important; border-radius: 0 !important; max-width: none !important; }
      .chat-widget-no-shadow .chat-messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; }
      .chat-widget-no-shadow .chat-message { max-width: 85%; padding: 0.75rem 1rem; border-radius: 1rem; position: relative; user-select: text; }
      .chat-widget-no-shadow .message-user { align-self: flex-end; border-bottom-right-radius: 0.25rem; margin-left: auto; text-align: right; }
      .chat-widget-no-shadow .message-assistant { align-self: flex-start; border-bottom-left-radius: 0.25rem; margin-right: auto; text-align: left; }
      .chat-widget-no-shadow .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 0.5rem; background-color: #f9f9f9; border-radius: 8px; margin-top: 4px; }
      .chat-widget-no-shadow .typing-indicator-dot { width: 5px; height: 5px; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; background-color: #3b82f6; }
      .chat-widget-no-shadow .typing-indicator-dot:nth-child(1) { animation-delay: -0.32s; }
      .chat-widget-no-shadow .typing-indicator-dot:nth-child(2) { animation-delay: -0.16s; }
    `;
    document.head.appendChild(customStylesElement);
    
    // Add zoom styles
    const zoomStylesLink = document.createElement('link');
    zoomStylesLink.rel = 'stylesheet';
    zoomStylesLink.href = 'https://unpkg.com/react-medium-image-zoom@5.1.9/dist/styles.css';
    document.head.appendChild(zoomStylesLink);
  }
  
  // Create React root on the wrapper element inside shadow DOM or on container if Shadow DOM is not supported
  const root = createRoot(reactWrapper);
  
  // Pass the shadowRoot reference to the ChatWidget component
  root.render(<ChatWidget {...config} shadowRootRef={shadowRoot} />);
  
  return {
    unmount: () => {
      root.unmount();
      
      // Clean up shadow DOM when unmounting
      if (supportsShadowDOM && shadowRoot) {
        while (shadowRoot.firstChild) {
          shadowRoot.removeChild(shadowRoot.firstChild);
        }
      } else {
        // Clean up when no Shadow DOM
        container.classList.remove('chat-widget-no-shadow');
        // Remove style elements if we added them to the head
        const styleLinks = document.querySelectorAll('link[href*="tailwindcss"], link[href*="react-medium-image-zoom"]');
        styleLinks.forEach(link => {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        });
        
        // Also remove any custom style elements we added
        const customStyles = document.querySelectorAll('style');
        customStyles.forEach(style => {
          const content = style.textContent || '';
          if (content.includes('.chat-widget-no-shadow') || content.includes('chat-window-enter')) {
            if (style.parentNode) {
              style.parentNode.removeChild(style);
            }
          }
        });
      }
    }
  };
}