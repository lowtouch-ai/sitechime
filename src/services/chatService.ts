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
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  let retryCount = 0;

  const makeRequest = async (): Promise<string> => {
    try {
      const timeoutSignal = AbortSignal.timeout(mergedConfig.timeoutMs!);
      const signal = mergedConfig.signal 
        ? AbortSignal.any([mergedConfig.signal, timeoutSignal])
        : timeoutSignal;

      const response = await fetch(mergedConfig.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepscaler:1.5b-preview-q4_K_M',
          messages,
          stream: Boolean(onChunk),
        } as ChatCompletionRequest),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (onChunk) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let content = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value);
            // Split by newlines and filter out empty lines
            const lines = chunk
              .split('\n')
              .filter(line => line.trim())
              .map(line => line.replace(/^data: /, '').trim());
            
            for (const line of lines) {

              console.log('line:', line);

              if (!line || line === '[DONE]') continue;

              try {
                // Some implementations might send partial JSON chunks
                // Try to parse only if it looks like valid JSON
                if (line.startsWith('{') && line.endsWith('}')) {
                  const parsed = JSON.parse(line);
                  const contentChunk = parsed.choices?.[0]?.delta?.content;
                  
                  if (contentChunk) {
                    onChunk(contentChunk);
                    content += contentChunk;
                  }
                }
              } catch (e) {
                // Log parsing error with the problematic line for debugging
                console.warn('Error parsing chunk:', e, '\nProblematic line:', line);
              }
            }
          }
          return content;
        } catch (error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            reader.cancel();
          }
          throw error;
        }
      } else {
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      
      if (retryCount < mergedConfig.maxRetries!) {
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
