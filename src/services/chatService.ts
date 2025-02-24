interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
}

interface ChatServiceConfig {
  endpoint?: string;
  timeoutMs?: number;
  maxRetries?: number;
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
      const response = await fetch(mergedConfig.endpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          stream: Boolean(onChunk),
        } as ChatCompletionRequest),
        signal: AbortSignal.timeout(mergedConfig.timeoutMs!),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (onChunk) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let content = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  onChunk(content);
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }

        return content;
      } else {
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      if (retryCount < mergedConfig.maxRetries! && error instanceof Error) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest();
      }
      throw error;
    }
  };

  return makeRequest();
};
