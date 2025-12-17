import type { AutoUIConfig } from '@lib/types';
import type { InstructionPlan } from '@lib/types/llmTypes';

export const buildDataAnalyzingPrompt = (
  data: any,
  config: AutoUIConfig,
  userMessage: string,
  plan: InstructionPlan,
  currentStepName: string,
): string => {
  const currentStep = plan.steps.find((s) => s.type == 'function' && s.name === currentStepName);
  console.log('Building data analyzing prompt for current step: ', currentStep);
  const indexOfNextStep = plan.steps.indexOf(currentStep!) + 1;
  console.log('Data being passed to the next step, which is ', plan.steps[indexOfNextStep]);
  let prompt = `You are an expert data analyst. Analyze the following data according to that user's message ${userMessage}.\n\nData:\n${JSON.stringify(data, null, 2)}\n Please provide response the same way as data structurized so that the data would fit for the next step to be executed properly. Note that the response which you give will most probably be passed as the params to the next step in the InstructionPlan. Here is the whole instruction plan for context: ${JSON.stringify(plan, null, 2)}.\n Current step name is: ${currentStepName}. Next step will use the data you provide as input parameters, so make sure to provide data in the correct format. The data about the next step is: ${plan.steps[indexOfNextStep]}.\n\nProvide only the JSON response without any additional text. The config for the next step is ${JSON.stringify(config.functions[(plan.steps[indexOfNextStep] as any).name])}`;
  return prompt;
};
