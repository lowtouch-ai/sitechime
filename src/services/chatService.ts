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
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk
      .split('\n')
      .filter(line => line.trim().startsWith('data: '))
      .map(line => line.replace('data: ', '').trim())
      .filter(line => line !== '[DONE]')
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (_) {
          return null;
        }
      })
      .filter(Boolean);

    for (const line of lines) {
      const content = line.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        onChunk?.(content);
      }
    }
  }

  return fullContent;
};
