import type { AutoUIConfig } from '@lib/types';
import type { StepExecutionError } from '@lib/core/errorHandling/errorHandlingWithLLM';

export function formatFailedStepInfo(failedStep: StepExecutionError, config: AutoUIConfig): {
  stepDescription: string;
  stepName: string;
} {
  let stepDescription = '';
  let stepName = '';

  if (failedStep.step.type === 'component') {
    const step = failedStep.step as { type: 'component'; name: string; props?: Record<string, any> };
    stepName = step.name;
    const componentConfig = config.components[step.name];
    if (componentConfig) {
      stepDescription = componentConfig.prompt;
    }
  } else if (failedStep.step.type === 'function') {
    const step = failedStep.step as { type: 'function'; name: string; params?: Record<string, any> };
    stepName = step.name;
    const functionConfig = config.functions[step.name];
    if (functionConfig) {
      stepDescription = functionConfig.prompt;
    }
  } else if (failedStep.step.type === 'text') {
    stepDescription = 'displaying text message';
    stepName = 'text step';
  }

  return { stepDescription, stepName };
}

