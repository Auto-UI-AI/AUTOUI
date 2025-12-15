import type { AutoUIConfig } from "@lib/types"
import { buildDataAnalyzingPrompt } from "./buildDataAnalyzingPrompt";
import type { InstructionPlan } from "@lib/types/llmTypes";
import { parseInstructionPlanFromSSE } from "./sseParser";

export const extraAnalysisWithLLM = async (data: any, config: AutoUIConfig, userMessage:string, plan: InstructionPlan, currentStepName: string): Promise<any> => {
    let response = await fetch(
        config.llm.proxyUrl + '/v1/chat/extraAnalysis',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.llm.sharedSecret}`,
            'x-autoui-secret': `${config.llm.sharedSecret}`,
          },
          body: JSON.stringify({
             appId: config.appId,
            model: config.llm.model ? config.llm.model : 'openai/gpt-5-chat',
            messages: [
              {
                role: 'user',
                content:buildDataAnalyzingPrompt(data, config, userMessage, plan, currentStepName)
                
              },
            ],
            temperature: config.llm.temperature,
          }),
        },
      );
      if (!response.ok || !response.body) {
    throw new Error(`LLM proxy error: ${response.status}`);
  }
  let res = await response.body
    // console.log("LLM response for extra data analysis: ", res.choices?.[0]?.message?.content);
    console.log('successfully sending response for extra data analysis from LLM');
  console.log('RAW PLAN FROM LLM for extra data analysis:');
    return parseInstructionPlanFromSSE(res);
}
