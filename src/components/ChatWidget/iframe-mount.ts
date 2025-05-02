import { ChatWidgetConfig } from './mount';
import { fetchWidgetConfig } from '../../services/configService';
import { WidgetConfig } from '../../types/widgetConfig';

// Add SiteChimeWidget to Window interface
declare global {
  interface Window {
    SiteChimeWidget?: {
      mountChatWidgetDirect: (containerId: string, config: ChatWidgetConfig & { apiHost?: string }) => void;
      setConfigUrl?: (configUrl: string) => void;
    };
  }
}

// HTML template for the iframe content
const iframeHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Widget</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
    }
    #chat-widget-container {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="chat-widget-container"></div>
</body>
</html>
`;

// Function to create and inject the iframe
export async function mountChatWidgetInIframe(containerId: string, config: ChatWidgetConfig): Promise<{ unmount: () => void }> {
  // Find the container element
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return { unmount: () => {} };
  }

  // Create the iframe
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.position = 'fixed';
  iframe.style.bottom = '0';
  iframe.style.right = config.position === 'bottom-left' ? 'auto' : '0';
  iframe.style.left = config.position === 'bottom-left' ? '0' : 'auto';
  iframe.style.zIndex = '9999';
  iframe.style.background = 'transparent';
  iframe.style.pointerEvents = 'none'; // Initially set to none so clicks pass through when closed
  iframe.title = 'Chat Widget';
  
  // Append the iframe to the container
  container.appendChild(iframe);

  // Pre-fetch the widget configuration to pass to the iframe
  let widgetConfig: WidgetConfig | null = null;
  try {
    // Fetch the widget configuration
    if (config.configUrl) {
      widgetConfig = await fetchWidgetConfig(config.configUrl);
      console.log('Fetched widget config for iframe:', widgetConfig);
    }
  } catch (error) {
    console.error('Error fetching widget config for iframe:', error);
  }

  // Get the iframe's document
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    console.error('Could not access iframe document');
    return { unmount: () => {} };
  }

  // Write the HTML template to the iframe
  iframeDoc.open();
  iframeDoc.write(iframeHtmlTemplate);
  iframeDoc.close();

  // Function to initialize the chat widget inside the iframe
  const initializeWidget = () => {
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) {
      console.error('Could not access iframe window');
      return;
    }

    // Create a style element for the CSS
    const style = iframeDoc.createElement('style');
    style.textContent = `
      /* Import the CSS from the parent window */
      ${Array.from(document.styleSheets)
        .filter(sheet => {
          try {
            // Only include our own stylesheets, not third-party ones
            return sheet.href && (
              sheet.href.includes('chat-widget') || 
              sheet.href.includes('index.css')
            );
          } catch {
            return false;
          }
        })
        .map(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch {
            return '';
          }
        })
        .join('\n')}
    `;
    iframeDoc.head.appendChild(style);

    // Add React and ReactDOM scripts
    const reactScript = iframeDoc.createElement('script');
    reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
    reactScript.crossOrigin = 'anonymous';
    iframeDoc.head.appendChild(reactScript);

    const reactDomScript = iframeDoc.createElement('script');
    reactDomScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
    reactDomScript.crossOrigin = 'anonymous';
    iframeDoc.head.appendChild(reactDomScript);

    // Add our chat widget script
    const widgetScript = iframeDoc.createElement('script');
    
    // Use the same script as the parent window
    const scriptSrc = Array.from(document.scripts)
      .find(script => script.src && script.src.includes('chat-widget'))?.src;
    
    if (scriptSrc) {
      widgetScript.src = scriptSrc;
      iframeDoc.head.appendChild(widgetScript);

      // Initialize the widget when the script is loaded
      widgetScript.onload = () => {
        // Set up the configuration in the iframe
        if (config.configUrl && iframeWindow.SiteChimeWidget) {
          // Set the config URL in the iframe
          if (iframeWindow.SiteChimeWidget.setConfigUrl) {
            iframeWindow.SiteChimeWidget.setConfigUrl(config.configUrl);
          }

          // Mount the widget in the iframe
          iframeWindow.SiteChimeWidget.mountChatWidgetDirect('chat-widget-container', {
            ...config,
            // If we have the pre-fetched config, pass the API host directly
            ...(widgetConfig && widgetConfig.security && widgetConfig.security.api && {
              apiHost: widgetConfig.security.api.host
            })
          });
        }
      };
    } else {
      console.error('Could not find chat widget script in parent window');
    }
  };

  // Initialize the widget once the iframe is loaded
  if (iframe.contentWindow?.document.readyState === 'complete') {
    initializeWidget();
  } else {
    iframe.onload = initializeWidget;
  }

  // Create a message listener to handle widget state changes
  window.addEventListener('message', (event) => {
    // Make sure the message is from our iframe
    if (event.source === iframe.contentWindow) {
      // Handle widget state changes
      if (event.data.type === 'WIDGET_STATE_CHANGE') {
        if (event.data.isOpen) {
          // When widget is open, enable pointer events
          iframe.style.pointerEvents = 'auto';
        } else {
          // When widget is closed, disable pointer events except for the toggle button area
          iframe.style.pointerEvents = 'none';
        }
      }
    }
  });

  // Return an object with methods to control the iframe
  return {
    unmount: () => {
      if (container && iframe) {
        container.removeChild(iframe);
      }
    }
  };
}
