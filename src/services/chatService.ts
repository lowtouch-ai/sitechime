interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
}

interface ChatServiceConfig {
  endpoint?: string;
  timeoutMs?: number;
  maxRetries?: number;
  signal?: AbortSignal;
}

const DEFAULT_CONFIG: ChatServiceConfig = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
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
          model: 'deepscaler:1.5b-preview-q4_K_M',
          messages,
          stream: Boolean(onChunk),
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
              // Find complete JSON messages
              let messageStart = buffer.indexOf('{"id":');
              if (messageStart === -1) break;
              
              // Look for the end of the JSON object
              let messageEnd = buffer.indexOf('}]}', messageStart);
              if (messageEnd === -1) break;
              messageEnd += 3; // Include the closing brackets
              
              // Extract and parse the complete message
              const message = buffer.slice(messageStart, messageEnd);
              try {
                const parsed = JSON.parse(message);
                const contentChunk = parsed.choices?.[0]?.delta?.content || '';
                if (contentChunk) {
                  console.log('Found content chunk:', contentChunk);
                  onChunk(contentChunk);
                  content += contentChunk;
                }
                
                // Remove processed message from buffer
                buffer = buffer.slice(messageEnd);
              } catch (e) {
                console.warn('Failed to parse message:', e);
                // If parsing failed, skip this malformed JSON by moving past the start
                buffer = buffer.slice(messageStart + 1);
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
