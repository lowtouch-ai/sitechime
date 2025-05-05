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
      fetch(new URL('../../../dist/data/openai-chat-widget.css', import.meta.url).toString()),
      loadZoomStylesIntoShadowDOM()
    ])
      .then(async ([mainCssResponse, zoomCss]) => {
        const mainCss = await mainCssResponse.text();
        
        // Inject all CSS into shadow DOM
        styles.textContent = mainCss + '\n' + zoomCss;
        shadowRoot?.prepend(styles);
      })
      .catch(error => {
        console.error('Failed to load widget styles:', error);
        // Fallback: Add empty style element
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