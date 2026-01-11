import type { AutoUIConfig } from '../types';
import type { InstructionPlan } from '../types/llmTypes';
import { parseInstructionPlanFromSSE } from './sseParser';
import { buildIntentPrompt } from './buildIntentPrompt';

export async function getInstructionPlan(userMessage: string, config: AutoUIConfig, prevMessagesForContext: string): Promise<InstructionPlan> {
  const autouiProxyUrl = config.llm.proxyUrl??'https://autoui-proxy.onrender.com'
  const res = await fetch(`${autouiProxyUrl}/chat/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AUTOUI-APP-ID': config.appId,
      ...(config.llm.sharedSecret && {
        'X-AUTOUI-SECRET': config.llm.sharedSecret,
        'authorization': 'Bearer ' + config.llm.sharedSecret,
      }),
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: buildIntentPrompt(userMessage, config, prevMessagesForContext),
        },
      ],
      temperature: config.llm.temperature,
      maxTokens: config.llm.maxTokens,
      appDescriptionPrompt: config.llm.appDescriptionPrompt,
      appId: config.appId,
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`AutoUI proxy error: ${res.status}`);
  }
  console.log('Response received from LLM proxy for instruction plan.: ', JSON.stringify(res.body));
  return parseInstructionPlanFromSSE(res.body);
}
