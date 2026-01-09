import type { AutoUIConfig } from '@lib/types';
import { buildDataAnalyzingPrompt } from './buildDataAnalyzingPrompt';
import type { InstructionPlan, InstructionStep } from '@lib/types/llmTypes';
import { parseAnalyzedData } from '../utils/formatting/parseAnalyzedData';

export const extraAnalysisWithLLM = async (
  data: unknown,
  config: AutoUIConfig,
  userMessage: string,
  prevMessagesForContext:string,
  plan: InstructionPlan,
  currentStep: InstructionStep,
  currentStepIndex: number,
  expectedSchema: { parseTo: 'array' | 'object' | 'primitive'; schema: unknown } | null
): Promise<any> => {
  const prompt = buildDataAnalyzingPrompt(
    data,
    config,
    userMessage,
    prevMessagesForContext,
    plan,
    currentStep,
    currentStepIndex,
    expectedSchema
  );

  const res = await fetch(`${config.llm.proxyUrl}/chat/extraAnalysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-AUTOUI-APP-ID': config.appId,
      ...(config.llm.sharedSecret && {
        'X-AUTOUI-SECRET': config.llm.sharedSecret,
      }),
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      temperature: config.llm.temperature,
      appId: config.appId,
    }),
  });

  if (!res.ok) {
    throw new Error(`AutoUI proxy error: ${res.status}`);
  }

  const content = await res.json();
  console.log('LLM extra analysis response content: ', content);
  console.log('LLM parsed content: ', parseAnalyzedData(content));
  return parseAnalyzedData(content);
};