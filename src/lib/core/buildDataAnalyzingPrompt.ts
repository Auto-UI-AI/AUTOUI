import type { InstructionPlan } from "@lib/types/llmTypes";

export const buildDataAnalyzingPrompt = (data: any, userMessage:string, plan: InstructionPlan, currentStepName: string): string => {
    let prompt = `You are an expert data analyst. Analyze the following data according to that user's message ${userMessage}.\n\nData:\n${JSON.stringify(data, null, 2)}\n Please provide response the same way as data structurized so that the data would fit for the next step to be executed properly. Note that the response which you give will most probably be passed as the params to the next step in the InstructionPlan. Here is the whole instruction plan for context: ${JSON.stringify(plan, null, 2)}.\n Current step name is: ${currentStepName}.`;
    return prompt;
}