import request from 'sync-request';

export const callChatGptApi = (messages) => {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  // @ts-ignore
  return request('POST', 'https://api.openai.com/v1/chat/completions', {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-nano',
      messages,
      // temperature: 0.4,
    }),
  });
};

export const parseGptResponse = (gptResponse) => {
  const gptText = JSON.parse(gptResponse.getBody('utf8'));
  const gptMessage = gptText.choices[0].message.content;
  let parsed = null;

  try {
    parsed = JSON.parse(gptMessage);
  } catch (e) {
    console.error('Failed to parse GPT response as JSON:', e);
  }

  return {
    raw: gptMessage,
    parsed,
    full: gptText,
  };
};
