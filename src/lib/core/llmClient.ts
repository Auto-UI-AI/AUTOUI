import type { AutoUIConfig } from '../types';
import type { InstructionPlan } from '../types/llmTypes';
import { parseInstructionPlanFromSSE } from './sseParser';
import { buildIntentPrompt } from './buildIntentPrompt';

export async function getInstructionPlan(userMessage: string, config: AutoUIConfig): Promise<InstructionPlan> {
  const res = await fetch(`${config.llm.proxyUrl}/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.llm.sharedSecret && {
        'x-autoui-secret': config.llm.sharedSecret,
      }),
    },
    body: JSON.stringify({
      appId: config.appId,
      messages: [
        {
          role: 'user',
          content: buildIntentPrompt(userMessage, config),
        },
      ],
      tools: config.runtime?.toolsSchema,
      temperature: config.llm.temperature,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`LLM proxy error: ${res.status}`);
  }

  return await parseInstructionPlanFromSSE(res.body);
}
