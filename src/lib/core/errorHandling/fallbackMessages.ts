import type { AutoUIConfig } from '@lib/types';
import type { ErrorHandlingRequest, ErrorHandlingResponse, StepExecutionError } from '@lib/types/errorHandlingTypes';
import { callErrorHandlingAPI, parseAPIResponse } from './apiHelpers';
import { buildErrorHandlingPrompt } from './promptBuilding';

export async function createFallbackErrorResponse(
  request: ErrorHandlingRequest,
  context: Record<string, any>,
  config: AutoUIConfig,
): Promise<ErrorHandlingResponse> {
  try {
    const prompt = await buildErrorHandlingPrompt(request, context, config);
    const response = await callErrorHandlingAPI(prompt, config);
    
    if (response.ok) {
      const llmResponse = await parseAPIResponse(response, request, config);
      const sanitized = sanitizeResponseForUser(llmResponse);
      if (sanitized.errorMessage) {
        console.error('🔍 [Error Handling] Debug info:', sanitized.errorMessage);
      }
      
      return sanitized;
    }
  } catch (error) {
    console.error('[Error Handling] Failed to get LLM fallback response:', error);
  }
  
  const { stepDescription, actionVerb } = extractStepInfo(request.failedStep, config);
  const fallbackMessage = buildFallbackMessage(request, stepDescription, actionVerb);
  
  console.error('🔍 [Error Handling] Debug info: Failed to get LLM response. Technical errors:', request.failedStep.errors);
  
  return {
    fallbackSuggestion: fallbackMessage,
    errorMessage: `Failed to get LLM response. Original errors: ${request.failedStep.errors.join('; ')}`,
    shouldRetry: false,
  };
}

function sanitizeResponseForUser(response: ErrorHandlingResponse): ErrorHandlingResponse {
  return {
    ...response,
    errorMessage: response.errorMessage ?? undefined,
    fallbackSuggestion: response.fallbackSuggestion ? sanitizeErrorMessage(response.fallbackSuggestion) : undefined,
  };
}

function sanitizeErrorMessage(message: string): string {
  const technicalTerms = [
    /validation\s+failed/gi,
    /required\s+prop/gi,
    /required\s+parameter/gi,
    /schema\s+validation/gi,
    /type\s+error/gi,
    /undefined/gi,
    /null\s+reference/gi,
    /runtime\s+error/gi,
    /component\s+render/gi,
  ];
  
  let sanitized = message;
  technicalTerms.forEach(term => {
    sanitized = sanitized.replace(term, '');
  });
  
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized || message;
}

function extractStepInfo(
  failedStep: StepExecutionError,
  config: AutoUIConfig,
): { stepDescription: string; actionVerb: string } {
  let stepDescription = '';
  let actionVerb = 'complete';

  if (failedStep.step.type === 'component') {
    const step = failedStep.step as { type: 'component'; name: string };
    const componentConfig = config.components[step.name];
    if (componentConfig) {
      stepDescription = componentConfig.prompt;
      actionVerb = determineActionVerbForComponent(stepDescription);
    }
  } else if (failedStep.step.type === 'function') {
    const step = failedStep.step as { type: 'function'; name: string };
    const functionConfig = config.functions[step.name];
    if (functionConfig) {
      stepDescription = functionConfig.prompt;
      actionVerb = determineActionVerbForFunction(stepDescription);
    }
  }

  return { stepDescription, actionVerb };
}

function determineActionVerbForComponent(description: string): string {
  const descLower = description.toLowerCase();
  
  if (descLower.includes('show') || descLower.includes('display')) {
    return 'show you';
  } else if (descLower.includes('load') || descLower.includes('fetch')) {
    return 'load';
  } else if (descLower.includes('point') || descLower.includes('highlight')) {
    return 'point to';
  }
  
  return 'complete';
}

function determineActionVerbForFunction(description: string): string {
  const descLower = description.toLowerCase();
  
  if (descLower.includes('fetch') || descLower.includes('load') || descLower.includes('get')) {
    return 'fetch';
  } else if (descLower.includes('save') || descLower.includes('update')) {
    return 'save';
  }
  
  return 'complete';
}

function buildFallbackMessage(
  request: ErrorHandlingRequest,
  stepDescription: string,
  actionVerb: string,
): string {
  let message = `I couldn't ${actionVerb} ${stepDescription || 'that'} for you. `;

  if (request.failedStep.errorType === 'validation') {
    const hasMissing = request.failedStep.errors.some(e => 
      e.toLowerCase().includes('required') || e.toLowerCase().includes('missing')
    );
    
    if (hasMissing) {
      message += buildMissingInfoMessage(stepDescription);
    } else {
      message += `The information provided doesn't quite match what I need. Could you try rephrasing your request?`;
    }
  } else {
    message += `Could you try rephrasing your request or being more specific about what you'd like me to do?`;
  }

  return message;
}

function buildMissingInfoMessage(stepDescription: string): string {
  const descLower = stepDescription.toLowerCase();
  
  let message = `I need a bit more information to help you with that. `;
  
  if (descLower.includes('point') || descLower.includes('highlight')) {
    message += `Could you tell me exactly which element you'd like me to point to? For example, you could say 'show me where the filters are' or 'point to the search button'.`;
  } else if (descLower.includes('show') || descLower.includes('display')) {
    message += `Could you be more specific about what you'd like to see? For example, you could say 'show me all tasks' or 'display my completed items'.`;
  } else {
    message += `Could you provide more details about what you're looking for?`;
  }
  
  return message;
}

