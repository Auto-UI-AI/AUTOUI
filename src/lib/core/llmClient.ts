import type { AutoUIConfig } from '../types';
import type { InstructionPlan } from '../types/llmTypes';
import { buildIntentPrompt } from './buildIntentPrompt';

export const getInstructionPlan = async (userMessage: string, config: AutoUIConfig): Promise<InstructionPlan> => {
  let response = await fetch(
    config.llm.baseUrl ? config.llm.baseUrl : 'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': config.llm.apiKey ? `Bearer ${config.llm.apiKey}` : '',
        'HTTP-Referer': config.metadata?.appName || 'autoui library user',
        'X-Title': (import.meta as any)?.env?.VITE_OPENROUTER_SITE_TITLE ?? 'AutoUI Demo',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.llm.model ? config.llm.model : 'openai/gpt-5-chat',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: buildIntentPrompt(userMessage, config),
              },
            ],
          },
        ],
      }),
    },
  );
  const data = await response.json();

  return data.choices?.[0]?.message?.content;
};
