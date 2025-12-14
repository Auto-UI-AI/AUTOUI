import type { AutoUIConfig } from '../types';
import type { InstructionPlan } from '../types/llmTypes';
import { buildIntentPrompt } from './buildIntentPrompt';

export const getInstructionPlan = async (
  userMessage: string,
  config: AutoUIConfig,
): Promise<InstructionPlan> => {
  const res = await fetch(config.llm.apiProxyUrl + '/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-autoui-secret': config.llm.apiProxyClientKey,
    },
    body: JSON.stringify({
      appId: config.metadata?.appName || 'autoui_demo',
      messages: [{ role: 'user', content: userMessage }],
      appDescriptionPrompt: buildIntentPrompt('Show me a beige coat ', config),
    }),
  });

  if (!res.ok) {
    console.error('HTTP error', res.status);
    console.error(await res.text());
    throw new Error(`HTTP error ${res.status}`);
  }

  if (!res.body) {
    console.error('ReadableStream not supported in this browser');
    throw new Error('ReadableStream not supported');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullText = ''; 

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const data = trimmed.slice('data:'.length).trim();
      if (!data || data === '[DONE]') {
        continue;
      }

      let json: any;
      try {
        json = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse JSON chunk', data, e);
        continue;
      }

      const delta = json.choices?.[0]?.delta;
      const chunkText: string = delta?.content ?? '';
      if (chunkText) {
        fullText += chunkText;
      }
    }
  }

  let plan: unknown;
  try {
    plan = JSON.parse(fullText);
  } catch (e) {
    console.error('Failed to parse plan JSON from streamed text:', fullText);
    throw new Error('Invalid plan JSON from LLM');
  }

  if (!plan || typeof plan !== 'object') {
    console.error('Parsed plan is not an object:', plan);
    throw new Error('Plan must be an object');
  }

  const typedPlan = plan as InstructionPlan;

  return typedPlan;
};