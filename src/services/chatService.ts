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

// Hard-coded completions endpoint path
const COMPLETIONS_API_PATH = '/api/openai/api/chat/completions';

// Helper function to get the full completions URL from config
const getCompletionsUrl = async (): Promise<string> => {
  try {
    const config = await fetchWidgetConfig('/widget-config.json');
    return `${config.security.api.host}${COMPLETIONS_API_PATH}`;
  } catch (error) {
    console.error('Error loading API configuration:', error);
    // Fallback to a default URL if configuration can't be loaded
    return 'https://api.openai.com/v1/chat/completions';
  }
};

const DEFAULT_CONFIG: ChatServiceConfig = {
  endpoint: 'https://api.openai.com/v1/chat/completions', // This will be overridden by getCompletionsUrl
  timeoutMs: 30000,
  maxRetries: 3,
};

export const sendChatMessage = async (
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  onChunk?: (chunk: string) => void,
  config: ChatServiceConfig = {}
): Promise<string> => {
  console.log('sendChatMessage called with messages:', messages);
  
  // Get dynamic endpoint from config if not explicitly provided
  if (!config.endpoint) {
    try {
      config.endpoint = await getCompletionsUrl();
      console.log('Using dynamic endpoint from config:', config.endpoint);
    } catch (error) {
      console.warn('Failed to get dynamic endpoint, using default');
    }
  }
  
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  let retryCount = 0;

  const makeRequest = async (): Promise<string> => {
    try {
      console.log('Making request to endpoint:', mergedConfig.endpoint);
      const timeoutSignal = AbortSignal.timeout(mergedConfig.timeoutMs!);
      const signal = mergedConfig.signal 
        ? AbortSignal.any([mergedConfig.signal, timeoutSignal])
        : timeoutSignal;

      const response = await fetch(mergedConfig.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-Config-Key': `${apiKey}`,
        },
        body: JSON.stringify({
          model: 'webshop:0.5',
          messages,
          stream: Boolean(onChunk),
          files: mergedConfig.ragFiles
        } as ChatCompletionRequest),
        signal,
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (onChunk) {
        console.log('Starting streaming response processing');
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let content = '';
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('Stream complete');
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log('Raw chunk received:', chunk);
            
            // Add new chunks to buffer
            buffer += chunk;
            console.log('Current buffer:', buffer);
            
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
                console.log('Received [DONE] message');
                buffer = buffer.slice(messageEnd + 1);
                continue;
              }
              
              try {
                const parsed = JSON.parse(message);
                const contentChunk = parsed.choices?.[0]?.delta?.content || '';
                if (contentChunk) {
                  console.log('Found content chunk:', contentChunk);
                  onChunk(contentChunk);
                  content += contentChunk;
                }
                
                // Remove processed message from buffer
                buffer = buffer.slice(messageEnd + 1);
              } catch (e) {
                console.warn('Failed to parse message:', e, 'Message was:', message);
                // If parsing failed, skip this malformed line
                buffer = buffer.slice(messageEnd + 1);
                continue;
              }
            }
            
            // Prevent buffer from growing too large
            if (buffer.length > 50000) {
              console.warn('Buffer too large, clearing');
              buffer = '';
            }
          }
          console.log('Final accumulated content:', content);
          return content;
        } catch (error: unknown) {
          console.error('Error in stream processing:', error);
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Stream aborted, canceling reader');
            reader.cancel();
          }
          throw error;
        }
      } else {
        console.log('Processing non-streaming response');
        const data = await response.json();
        console.log('Non-streaming response data:', data);
        return data.choices[0]?.message?.content || '';
      }
    } catch (error: unknown) {
      console.error('Request error:', error);
      if (error instanceof Error && error.name === 'AbortError') throw error;
      
      if (retryCount < mergedConfig.maxRetries!) {
        console.log(`Retrying request (attempt ${retryCount + 1}/${mergedConfig.maxRetries})`);
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
