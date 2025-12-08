import type { AutoUIConfig } from "@lib/types"
import { buildDataAnalyzingPrompt } from "./buildDataAnalyzingPrompt";
import type { InstructionPlan } from "@lib/types/llmTypes";

export const extraAnalysisWithLLM = async (data: any, config: AutoUIConfig, userMessage:string, plan: InstructionPlan, currentStepName: string): Promise<any> => {
    let response = await fetch(
        config.llm.baseUrl ? config.llm.baseUrl : 'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': config.llm.apiKey ? `Bearer ${config.llm.apiKey}` : '',
            'HTTP-Referer': config.metadata?.appName || 'autoui library user',
            'X-Title': config.metadata?.appName ?? 'AutoUI Demo',
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
                    text: buildDataAnalyzingPrompt(data, config, userMessage, plan, currentStepName),
                  },
                ],
              },
            ],
          }),
        },
      );
    const res = await response.json();
    console.log("LLM response for extra data analysis: ", res.choices?.[0]?.message?.content);
    // console.log(typeof res.choices?.[0]?.message?.content);
    return JSON.parse(res.choices?.[0]?.message?.content);
}
