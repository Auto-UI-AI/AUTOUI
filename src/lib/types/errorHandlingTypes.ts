import type { InstructionPlan, InstructionStep } from './llmTypes';

export interface StepExecutionError {
  step: InstructionStep;
  stepIndex: number;
  errorType: 'validation' | 'runtime' | 'component_render';
  errors: string[];
  context: Record<string, any>;
  props?: Record<string, any>;
}

export interface ErrorHandlingRequest {
  userMessage: string;
  prevMessagesForContext: string;
  plan: InstructionPlan;
  executedSteps: InstructionStep[];
  failedStep: StepExecutionError;
}

export interface ErrorHandlingResponse {
  newInstructionPlan?: InstructionPlan | null;
  errorMessage?: string;
  shouldRetry?: boolean;
  modifiedContext?: Record<string, any>;
  fallbackSuggestion?: string;
}

