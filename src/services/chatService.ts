interface ChatCompletionRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
}

export const sendChatMessage = async (
  messages: Array<{ role: string; content: string }>,
  apiKey: string
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
    } as ChatCompletionRequest),
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
