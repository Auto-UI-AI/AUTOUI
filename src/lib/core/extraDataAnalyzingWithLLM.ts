import type { AutoUIConfig } from '@lib/types';
import { buildDataAnalyzingPrompt } from './buildDataAnalyzingPrompt';
import type { InstructionPlan } from '@lib/types/llmTypes';
import { parseInstructionPlanFromSSE } from './sseParser';

export const extraAnalysisWithLLM = async (
  data: any,
  config: AutoUIConfig,
  userMessage: string,
  plan: InstructionPlan,
  currentStepName: string,
): Promise<any> => {
  const res = await fetch(`${config.llm.proxyUrl}/chat/extra-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',

      'X-AUTOUI-APP-ID': config.appId,

      ...(config.llm.sharedSecret && {
        'X-AUTOUI-SECRET': config.llm.sharedSecret,
      }),
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: buildDataAnalyzingPrompt(data, config, userMessage, plan, currentStepName),
        },
      ],
      temperature: config.llm.temperature,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`AutoUI proxy error: ${res.status}`);
  }

  return parseInstructionPlanFromSSE(res.body);
};
