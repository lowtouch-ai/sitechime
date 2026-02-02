import { createRoot } from 'react-dom/client';
import { ChatWidget } from './ChatWidget';
import type { ChatTheme } from './types';
import { Logger } from '../../utils/logger';
// Load the component CSS as a raw string so we can inject it into the shadow root
// This works in both dev (vite) and production builds.
import widgetCss from './ChatWidget.css?raw';
// Remove direct CSS imports since we'll inject them into shadow DOM
// import '../../../src/index.css';
// import './ChatWidget.css';

export interface ChatWidgetConfig {
  apiKey: string;
  theme?: Partial<ChatTheme>;
  position?: 'bottom-right' | 'bottom-left';
  configUrl: string;
  // Optional external headers the host page wants forwarded on behalf of
  // the embedding client (e.g. X-LTAI-EXT-* headers). Values should be
  // strings and will be attached to outgoing API requests originating
  // from the widget.
  externalHeaders?: Record<string, string>;
}

export function mountChatWidget(containerId: string, config: ChatWidgetConfig) {
  const container = document.getElementById(containerId);
  if (!container) {
    Logger.error(`Container with id "${containerId}" not found`);
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
    
    // Add the link and style elements to the shadow DOM
    shadowRoot.appendChild(linkElement);
    shadowRoot.appendChild(customStyles);
    
    // Inject the CSS string directly (works in dev and build). Fall back to fetch if
    // the raw import isn't available for any reason.
    try {
      customStyles.textContent = widgetCss;
      Logger.log('Injected ChatWidget.css via raw import, length:', widgetCss.length);
    } catch (err) {
      Logger.warn('Raw CSS import failed, falling back to fetch:', err);
      try {
        const cssPath = new URL('./ChatWidget.css', import.meta.url).href;
        fetch(cssPath)
          .then(response => {
            if (!response.ok) throw new Error(`Failed to load CSS: ${response.status} ${response.statusText}`);
            return response.text();
          })
          .then(cssText => { customStyles.textContent = cssText; })
          .catch(e => Logger.error('Error loading ChatWidget.css via fetch:', e));
      } catch (e) {
        Logger.error('Error setting up CSS fetch fallback:', e);
      }
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
          Logger.log('Successfully loaded zoom styles');
        }
      })
      .catch(error => {
        Logger.error('Failed to load zoom styles:', error);
      });
  } else {
    // Fallback for browsers that don't support Shadow DOM
    Logger.warn('Shadow DOM is not supported in this browser. Chat widget styles may be affected by the page styles.');
    
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
    customStylesElement.textContent = widgetCss;
    document.head.appendChild(customStylesElement);
    
    // Add zoom styles
    const zoomStylesLink = document.createElement('link');
    zoomStylesLink.rel = 'stylesheet';
    zoomStylesLink.href = 'https://unpkg.com/react-medium-image-zoom@5.1.9/dist/styles.css';
    document.head.appendChild(zoomStylesLink);
  }
  
  // Create React root on the wrapper element inside shadow DOM or on container if Shadow DOM is not supported
  const root = createRoot(reactWrapper);
  
  // If the host passed externalHeaders into the mount API, expose them on a
  // page-level global as well so pages that rely on the global fallback can
  // benefit without changing embed code.
  if (typeof window !== 'undefined' && config.externalHeaders) {
    (window as any).__LTAI_EXT_HEADERS__ = config.externalHeaders;
    Logger.log('mountChatWidget: set window.__LTAI_EXT_HEADERS__ with keys', Object.keys(config.externalHeaders));
  }

  // Pass the shadowRoot reference to the ChatWidget component
  root.render(<ChatWidget {...config} shadowRootRef={shadowRoot} externalHeaders={config.externalHeaders} />);
  
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