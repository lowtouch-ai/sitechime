interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
}

export const sendChatMessage = async (
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const response = await fetch('http://localhost:1234/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      stream: true,
    } as ChatCompletionRequest),
  });

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and add it to the buffer
      buffer += decoder.decode(value, { stream: true });

      // Split the buffer into lines and process each complete line
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        if (line.includes('[DONE]')) continue;

        try {
          const data = JSON.parse(line.replace('data: ', ''));
          const content = data.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            onChunk?.(content);
          }
        } catch (e) {
          console.warn('Failed to parse streaming response line:', e);
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer) {
      const line = buffer.replace('data: ', '');
      try {
        const data = JSON.parse(line);
        const content = data.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onChunk?.(content);
        }
      } catch (e) {
        // Ignore parsing errors for incomplete chunks
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
};
