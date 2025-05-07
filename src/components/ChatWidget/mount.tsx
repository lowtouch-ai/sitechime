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
    
    // Create style element for Tailwind and our custom styles
    const styles = document.createElement('style');
    
    // Load CSS for image zoom library
    const loadZoomStylesIntoShadowDOM = async () => {
      try {
        const zoomCssResponse = await fetch('https://unpkg.com/react-medium-image-zoom@5.1.9/dist/styles.css');
        return await zoomCssResponse.text();
      } catch (error) {
        console.error('Failed to load image zoom styles:', error);
        return '';
      }
    };
    
    // Import Tailwind and component styles
    Promise.all([
      // Use a relative path that will work in both dev and production
      fetch(new URL('../../../dist/data/openai-chat-widget.css', import.meta.url).toString())
        .catch(() => {
          // Fallback to look for CSS in the same directory as the JS file
          console.log('Trying fallback CSS path...');
          const scriptPath = document.currentScript?.getAttribute('src') || '';
          const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
          return fetch(`${basePath}/openai-chat-widget.css`);
        }),
      loadZoomStylesIntoShadowDOM()
    ])
      .then(async ([mainCssResponse, zoomCss]) => {
        if (!mainCssResponse.ok) {
          throw new Error(`Failed to load CSS: ${mainCssResponse.status} ${mainCssResponse.statusText}`);
        }
        const mainCss = await mainCssResponse.text();
        
        // Add ChatWidget.css content directly
        const widgetCss = `
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
          /* Essential styles to ensure the widget works properly */
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
        `;
        
        // Inject all CSS into shadow DOM
        styles.textContent = mainCss + '\n' + widgetCss + '\n' + zoomCss;
        shadowRoot?.prepend(styles);
        
        console.log('Successfully loaded and injected CSS into Shadow DOM');
      })
      .catch(error => {
        console.error('Failed to load widget styles:', error);
        // Fallback: Add basic styles directly
        const fallbackStyles = `
          .chat-widget { position: fixed; z-index: 1000; bottom: 20px; right: 20px; display: flex; flex-direction: column; }
          .chat-window { position: fixed; bottom: 80px; right: 20px; min-height: 500px; width: 400px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; }
          .chat-window.visible { display: flex; }
          .chat-messages { flex: 1; overflow-y: auto; padding: 1rem; }
          .chat-message { max-width: 85%; padding: 0.75rem 1rem; border-radius: 1rem; margin-bottom: 0.5rem; }
          .message-user { align-self: flex-end; background-color: #3b82f6; color: white; margin-left: auto; }
          .message-assistant { align-self: flex-start; background-color: #f3f4f6; color: black; margin-right: auto; }
        `;
        styles.textContent = fallbackStyles;
        shadowRoot?.prepend(styles);
      });
  } else {
    // Fallback for browsers that don't support Shadow DOM
    console.warn('Shadow DOM is not supported in this browser. Chat widget styles may be affected by the page styles.');
    
    // Use container directly
    reactWrapper = container;
    
    // Add a unique class to the container for scoping
    container.classList.add('chat-widget-no-shadow');
    
    // Load CSS directly in the document head
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = new URL('../../../dist/data/openai-chat-widget.css', import.meta.url).toString();
    document.head.appendChild(linkElement);
    
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
        const styleLinks = document.querySelectorAll('link[href*="openai-chat-widget.css"], link[href*="react-medium-image-zoom"]');
        styleLinks.forEach(link => {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        });
      }
    }
  };
}