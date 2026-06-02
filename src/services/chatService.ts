interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  files?: Array<{ type: 'file' | 'collection', id: string }>;
}

interface ChatServiceConfig {
  endpoint?: string;
  timeoutMs?: number;
  maxRetries?: number;
  signal?: AbortSignal;
  ragFiles?: Array<{ type: 'file' | 'collection', id: string }>;
}

// Import the fetchWidgetConfig function
import { fetchWidgetConfig } from './configService';
import { Logger } from '../utils/logger';
import { joinUrl } from '../utils/url';

// Hard-coded completions endpoint path
const COMPLETIONS_API_PATH = '/api/openai/api/chat/completions';

// Default model to use if not specified in config
const DEFAULT_MODEL = 'webshop:0.5';

// Global configUrl that can be set by the application
let _configUrl: string = '/widget-config.json'; // Default fallback value
// Optional external headers provided by the host page (e.g. X-LTAI-EXT-*)
let _externalHeaders: Record<string, string> | undefined;

/**
 * Set the configuration URL to be used by the chat service
 * @param configUrl - The URL to fetch widget configuration from
 */
export const setConfigUrl = (configUrl: string): void => {
  _configUrl = configUrl;
};

export const setExternalHeaders = (headers: Record<string, string> | undefined): void => {
  _externalHeaders = headers;
};

// Helper function to get the full completions URL and model from config
const getCompletionsConfig = async (): Promise<{ url: string, model: string }> => {
  try {
    const config = await fetchWidgetConfig(_configUrl);
    const url = joinUrl(config.security.api.host, COMPLETIONS_API_PATH);
    
    // Check if model name is in the config - looking in security.api section
    // This is a flexible approach that will work even if model is added later
    const model = (config.security.api as any).model || DEFAULT_MODEL;
    
    return { url, model };
  } catch (error) {
    Logger.error('Error loading API configuration:', error);
    // Fallback to defaults if configuration can't be loaded
    return {  
      url: 'https://api.openai.com/v1/chat/completions',
      model: DEFAULT_MODEL
    };
  }
};

const DEFAULT_CONFIG: ChatServiceConfig = {
  endpoint: 'https://api.openai.com/v1/chat/completions', // This will be overridden by getCompletionsConfig
  timeoutMs: 30000,
  maxRetries: 3,
};

export const sendChatMessage = async (
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  onChunk?: (chunk: string) => void,
  config: ChatServiceConfig = {}
): Promise<string> => {
  Logger.log('sendChatMessage called with messages:', messages);
  
  // Get dynamic endpoint from config if not explicitly provided
  if (!config.endpoint) {
    try {
      const { url } = await getCompletionsConfig();
      config.endpoint = url;
      Logger.log('Using dynamic endpoint from config:', config.endpoint);
    } catch (error) {
      Logger.warn('Failed to get dynamic endpoint, using default');
    }
  }
  
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  let retryCount = 0;

  const makeRequest = async (): Promise<string> => {
    try {
      Logger.log('Making request to endpoint:', mergedConfig.endpoint);
      const timeoutSignal = AbortSignal.timeout(mergedConfig.timeoutMs!);
      const signal = mergedConfig.signal 
        ? AbortSignal.any([mergedConfig.signal, timeoutSignal])
        : timeoutSignal;

      // Get the model name from configuration
      const { model } = await getCompletionsConfig();
      // console.log('Using model from config:', model);

      // Read window.__LTAI_EXT_HEADERS__ at request time so console assignments
      // after widget load are picked up without a page refresh.
      const rawWindowHeaders = typeof window !== 'undefined'
        ? (window as any).__LTAI_EXT_HEADERS__
        : undefined;
      const windowHeaders: Record<string, string> | undefined =
        rawWindowHeaders && typeof rawWindowHeaders === 'object' && !Array.isArray(rawWindowHeaders)
          ? rawWindowHeaders as Record<string, string>
          : undefined;
      if (rawWindowHeaders !== undefined && windowHeaders === undefined) {
        Logger.warn('window.__LTAI_EXT_HEADERS__ is set but is not a plain object — ignoring it');
      }

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Config-Key': `${apiKey}`,
        ...(_externalHeaders || {}),
        ...(windowHeaders || {}),
      };

      // Dev-friendly debug: log header NAMES being sent (do NOT print sensitive values)
      try {
        Logger.log('sendChatMessage: sending headers ->', Object.keys(requestHeaders));
        Logger.log('sendChatMessage: external header keys ->', Object.keys(_externalHeaders || {}));
      } catch (e) {
        /* ignore logging errors */
      }

      const response = await fetch(mergedConfig.endpoint!, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          model: model, // Use model from config instead of hardcoded value
          messages,
          stream: Boolean(onChunk),
          files: mergedConfig.ragFiles
        } as ChatCompletionRequest),
        signal,
      });

      Logger.log('Response status:', response.status);
      Logger.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const httpErr = new Error(`HTTP error! status: ${response.status}`);
        (httpErr as any).statusCode = response.status;
        throw httpErr;
      }

      if (onChunk) {
        Logger.log('Starting streaming response processing');
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let content = '';
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              Logger.log('Stream complete');
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            //console.log('Raw chunk received:', chunk);
            
            // Add new chunks to buffer
            buffer += chunk;
            Logger.log('Current buffer:', buffer);
            
            // Process complete messages from the buffer
            while (true) {
              // Find complete SSE messages (data: prefix followed by JSON)
              let messageStart = buffer.indexOf('data: ');
              if (messageStart === -1) break;
              
              // Move past the 'data: ' prefix
              messageStart += 6;
              
              // Check for the end of the message (newline)
              let messageEnd = buffer.indexOf('\n', messageStart);
              if (messageEnd === -1) break;
              
              // Extract the message text
              const message = buffer.slice(messageStart, messageEnd).trim();
              
              // Handle special [DONE] message
              if (message === '[DONE]') {
                Logger.log('Received [DONE] message');
                buffer = buffer.slice(messageEnd + 1);
                continue;
              }
              
              try {
                const parsed = JSON.parse(message);
                const contentChunk = parsed.choices?.[0]?.delta?.content || '';
                if (contentChunk) {
                  Logger.log('Found content chunk:', contentChunk);
                  onChunk(contentChunk);
                  content += contentChunk;
                }
                
                // Remove processed message from buffer
                buffer = buffer.slice(messageEnd + 1);
              } catch (e) {
                Logger.warn('Failed to parse message:', e, 'Message was:', message);
                // If parsing failed, skip this malformed line
                buffer = buffer.slice(messageEnd + 1);
                continue;
              }
            }
            
            // Prevent buffer from growing too large
            if (buffer.length > 50000) {
              Logger.warn('Buffer too large, clearing');
              buffer = '';
            }
          }
          Logger.log('Final accumulated content:', content);
          return content;
        } catch (error: unknown) {
          Logger.error('Error in stream processing:', error);
          if (error instanceof Error && error.name === 'AbortError') {
            Logger.log('Stream aborted, canceling reader');
            reader.cancel();
          }
          throw error;
        }
      } else {
        Logger.log('Processing non-streaming response');
        const data = await response.json();
        Logger.log('Non-streaming response data:', data);
        return data.choices[0]?.message?.content || '';
      }
    } catch (error: unknown) {
      Logger.error('Request error:', error);
      if (error instanceof Error && error.name === 'AbortError') throw error;
      
      if (retryCount < mergedConfig.maxRetries!) {
        Logger.log(`Retrying request (attempt ${retryCount + 1}/${mergedConfig.maxRetries})`);
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest();
      }
      throw error;
    }
  };

  return makeRequest();
};
