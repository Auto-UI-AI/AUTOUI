import type { StepExecutionError } from '@lib/types/errorHandlingTypes';

export function analyzeErrorContext(
  failedStep: StepExecutionError,
  stepDescription: string,
  userMessage: string,
): string {
  const errorType = failedStep.errorType;
  const errors = failedStep.errors;
  
  let analysis = '';

  if (errorType === 'validation') {
    analysis = analyzeValidationError(failedStep, errors);
  } else if (errorType === 'runtime') {
    analysis = analyzeRuntimeError(failedStep);
  } else if (errorType === 'component_render') {
    analysis = analyzeComponentRenderError();
  } else {
    analysis = `Something went wrong while trying to ${stepDescription || 'complete the action'}. `;
    analysis += `The user's request might need to be more specific or rephrased.`;
  }

  if (userMessage) {
    analysis += `\n\nThe user's request was: "${userMessage}". Consider this context when suggesting how they can rephrase or provide more information.`;
  }
  
  return analysis;
}

function analyzeValidationError(
  failedStep: StepExecutionError,
  errors: string[],
): string {
  const missingRequired = errors.some(e => 
    e.toLowerCase().includes('required') || 
    e.toLowerCase().includes('missing')
  );
  
  if (missingRequired) {
    let analysis = `The ${failedStep.step.type === 'component' ? 'component' : 'function'} needs some information that wasn't provided. `;

    const missingItems: string[] = [];
    errors.forEach(e => {
      const match = e.match(/['"]([^'"]+)['"]/);
      if (match) {
        missingItems.push(match[1]);
      }
    });
    
    if (missingItems.length > 0) {
      analysis += `Specifically, information about: ${missingItems.join(', ')}. `;
    }
    
    analysis += `This information needs to be extracted from the user's request or provided explicitly.`;
    return analysis;
  } else {
    return `The ${failedStep.step.type === 'component' ? 'component' : 'function'} received information that doesn't match what it expects. ` +
           `This might be because the user's request wasn't specific enough or the information couldn't be extracted correctly.`;
  }
}

function analyzeRuntimeError(failedStep: StepExecutionError): string {
  return `The ${failedStep.step.type === 'component' ? 'component' : 'function'} encountered a problem while trying to execute. ` +
         `This could be because the requested data isn't available, the operation isn't possible right now, or there's a temporary issue.`;
}

function analyzeComponentRenderError(): string {
  return `The component couldn't be displayed. ` +
         `This might be because some required information is missing or the component needs different information than what was provided.`;
}

