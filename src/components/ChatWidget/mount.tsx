import { createRoot } from 'react-dom/client';
import { ChatWidget } from './ChatWidget';
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
  customCSS?: {
    enabled: boolean;
    path: string;
  };
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
    
    // Add required styles to shadow DOM
    const addStyleToShadowDOM = (href: string, isStylesheet = true) => {
      if (isStylesheet) {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = href;
        shadowRoot?.appendChild(linkElement);
      } else {
        fetch(href)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch CSS: ${response.status}`);
            }
            return response.text();
          })
          .then(cssText => {
            const styleElement = document.createElement('style');
            styleElement.textContent = cssText;
            shadowRoot?.appendChild(styleElement);
          })
          .catch(error => console.error(`Error loading CSS from ${href}:`, error));
      }
    };
    
    // Add Tailwind CSS
    addStyleToShadowDOM('https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css');
    
    // Add zoom styles
    addStyleToShadowDOM('https://unpkg.com/react-medium-image-zoom@5.1.9/dist/styles.css');
    
    // Add ChatWidget.css
    addStyleToShadowDOM('./ChatWidget.css', false);
    
    // Add custom CSS if enabled in config
    if (config.customCSS?.enabled && config.customCSS.path) {
      console.log('Loading custom CSS from:', config.customCSS.path);
      addStyleToShadowDOM(config.customCSS.path, false);
    }
  } else {
    // Fallback for browsers without Shadow DOM support
    console.warn('Shadow DOM is not supported in this browser. Using regular DOM instead.');
    
    // Create a wrapper element for React to render into
    reactWrapper = document.createElement('div');
    reactWrapper.id = 'chat-widget-wrapper';
    container.appendChild(reactWrapper);
    
    // Add custom CSS if enabled in config
    if (config.customCSS?.enabled && config.customCSS.path) {
      console.log('Loading custom CSS in non-shadow DOM mode from:', config.customCSS.path);
      const linkElement = document.createElement('link');
      linkElement.rel = 'stylesheet';
      linkElement.href = config.customCSS.path;
      document.head.appendChild(linkElement);
    }
  }
  
  // Create React root and render the component
  const root = createRoot(reactWrapper);
  root.render(<ChatWidget {...config} shadowRootRef={shadowRoot} />);
  
  return {
    unmount: () => {
      root.unmount();
      
      // Clean up when unmounting
      if (supportsShadowDOM && shadowRoot) {
        while (shadowRoot.firstChild) {
          shadowRoot.removeChild(shadowRoot.firstChild);
        }
      } else if (reactWrapper.parentNode) {
        reactWrapper.parentNode.removeChild(reactWrapper);
      }
    }
  };
}