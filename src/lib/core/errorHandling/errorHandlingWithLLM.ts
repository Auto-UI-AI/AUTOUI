import type { AutoUIConfig } from '@lib/types';
import type { InstructionPlan, InstructionStep } from '@lib/types/llmTypes';
import { formatComponentCallbacks } from '@lib/utils/formatting/formatComponentCallbacks';
import { formatFunctionConfigsForErrorHandling } from '@lib/utils/formatting/formatFunctionConfigsForErrorHandling';
import { formatFunctionSchemasForErrorHandling } from '@lib/utils/formatting/formatFunctionSchemasForErrorHandling';
import { formatComponentSchemasForErrorHandling } from '@lib/utils/formatting/formatComponentSchemasForErrorHandling';
import { formatExecutedStepsForErrorHandling } from '@lib/utils/formatting/formatExecutedStepsForErrorHandling';
import { formatFailedStepInfo } from '@lib/utils/formatting/formatFailedStepInfo';

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

export const errorHandlingWithLLM = async (
  request: ErrorHandlingRequest,
  context: Record<string, any>,
  config: AutoUIConfig,
): Promise<ErrorHandlingResponse> => {
  const prompt = await buildErrorHandlingPrompt(request, context, config);
  const autouiProxyUrl = config.llm.proxyUrl ?? 'https://autoui-proxy.onrender.com';
  
  const res = await fetch(`${autouiProxyUrl}/chat/errorHandling`, {
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
      temperature: config.llm.temperature ?? 0.2,
      appId: config.appId,
    }),
  });

  if (!res.ok) {
    console.error(`[Error Handling] API failed with status ${res.status}. Technical errors:`, request.failedStep.errors);
    
    let stepDescription = '';
    let actionVerb = 'complete';
    
    if (request.failedStep.step.type === 'component') {
      const step = request.failedStep.step as { type: 'component'; name: string };
      const componentConfig = config.components[step.name];
      if (componentConfig) {
        stepDescription = componentConfig.prompt;
        const descLower = stepDescription.toLowerCase();
        if (descLower.includes('show') || descLower.includes('display')) {
          actionVerb = 'show you';
        } else if (descLower.includes('load') || descLower.includes('fetch')) {
          actionVerb = 'load';
        } else if (descLower.includes('point') || descLower.includes('highlight')) {
          actionVerb = 'point to';
        }
      }
    } else if (request.failedStep.step.type === 'function') {
      const step = request.failedStep.step as { type: 'function'; name: string };
      const functionConfig = config.functions[step.name];
      if (functionConfig) {
        stepDescription = functionConfig.prompt;
        const descLower = stepDescription.toLowerCase();
        if (descLower.includes('fetch') || descLower.includes('load') || descLower.includes('get')) {
          actionVerb = 'fetch';
        } else if (descLower.includes('save') || descLower.includes('update')) {
          actionVerb = 'save';
        }
      }
    }
    
    let fallbackMessage = `I couldn't ${actionVerb} ${stepDescription || 'that'} for you. `;
    
    if (request.failedStep.errorType === 'validation') {
      const hasMissing = request.failedStep.errors.some(e => 
        e.toLowerCase().includes('required') || e.toLowerCase().includes('missing')
      );
      
      if (hasMissing) {
        fallbackMessage += `I need a bit more information to help you with that. `;
        
        if (stepDescription.toLowerCase().includes('point') || stepDescription.toLowerCase().includes('highlight')) {
          fallbackMessage += `Could you tell me exactly which element you'd like me to point to? For example, you could say 'show me where the filters are' or 'point to the search button'.`;
        } else if (stepDescription.toLowerCase().includes('show') || stepDescription.toLowerCase().includes('display')) {
          fallbackMessage += `Could you be more specific about what you'd like to see? For example, you could say 'show me all tasks' or 'display my completed items'.`;
        } else {
          fallbackMessage += `Could you provide more details about what you're looking for?`;
        }
      } else {
        fallbackMessage += `The information provided doesn't quite match what I need. Could you try rephrasing your request?`;
      }
    } else {
      fallbackMessage += `Could you try rephrasing your request or being more specific about what you'd like me to do?`;
    }
    
    return {
      errorMessage: fallbackMessage,
      shouldRetry: false,
    };
  }

  try {
    const content = await res.json();
    console.log('Error handling response:', content);
    
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch {
        return {
          errorMessage: content,
          shouldRetry: false,
        };
      }
    }
    
    return {
      newInstructionPlan: content.newInstructionPlan ?? null,
      errorMessage: content.errorMessage ?? null,
      shouldRetry: content.shouldRetry ?? false,
      modifiedContext: content.modifiedContext ?? null,
      fallbackSuggestion: content.fallbackSuggestion ?? null,
    };
  } catch (e) {
    console.error('[Error Handling] Failed to parse response. Technical error:', e);
    console.error('[Error Handling] Original errors:', request.failedStep.errors);
    
    let stepDescription = '';
    let actionVerb = 'complete';
    
    if (request.failedStep.step.type === 'component') {
      const step = request.failedStep.step as { type: 'component'; name: string };
      const componentConfig = config.components[step.name];
      if (componentConfig) {
        stepDescription = componentConfig.prompt;
        const descLower = stepDescription.toLowerCase();
        if (descLower.includes('show') || descLower.includes('display')) {
          actionVerb = 'show you';
        } else if (descLower.includes('load') || descLower.includes('fetch')) {
          actionVerb = 'load';
        } else if (descLower.includes('point') || descLower.includes('highlight')) {
          actionVerb = 'point to';
        }
      }
    } else if (request.failedStep.step.type === 'function') {
      const step = request.failedStep.step as { type: 'function'; name: string };
      const functionConfig = config.functions[step.name];
      if (functionConfig) {
        stepDescription = functionConfig.prompt;
        const descLower = stepDescription.toLowerCase();
        if (descLower.includes('fetch') || descLower.includes('load') || descLower.includes('get')) {
          actionVerb = 'fetch';
        } else if (descLower.includes('save') || descLower.includes('update')) {
          actionVerb = 'save';
        }
      }
    }
    
    let fallbackMessage = `I couldn't ${actionVerb} ${stepDescription || 'that'} for you. `;
    
    if (request.failedStep.errorType === 'validation' && request.failedStep.errors.some(e => e.includes('required'))) {
      fallbackMessage += `I need a bit more information to help you with that. `;
      
      if (stepDescription.toLowerCase().includes('point') || stepDescription.toLowerCase().includes('highlight')) {
        fallbackMessage += `Could you tell me exactly which element you'd like me to point to? For example, you could say 'show me where the filters are' or 'point to the search button'.`;
      } else if (stepDescription.toLowerCase().includes('show') || stepDescription.toLowerCase().includes('display')) {
        fallbackMessage += `Could you be more specific about what you'd like to see? For example, you could say 'show me all tasks' or 'display my completed items'.`;
      } else {
        fallbackMessage += `Could you provide more details about what you're looking for?`;
      }
    } else {
      fallbackMessage += `Could you try rephrasing your request or being more specific about what you'd like me to do?`;
    }
    
    return {
      errorMessage: fallbackMessage,
      shouldRetry: false,
    };
  }
};

function analyzeErrorContext(
  failedStep: StepExecutionError,
  stepDescription: string,
  userMessage: string,
): string {
  const errorType = failedStep.errorType;
  const errors = failedStep.errors;
  
  let analysis = '';
  
  if (errorType === 'validation') {
    const missingRequired = errors.some(e => 
      e.toLowerCase().includes('required') || 
      e.toLowerCase().includes('missing')
    );
    
    if (missingRequired) {
      analysis = `The ${failedStep.step.type === 'component' ? 'component' : 'function'} needs some information that wasn't provided. `;

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
    } else {
      analysis = `The ${failedStep.step.type === 'component' ? 'component' : 'function'} received information that doesn't match what it expects. `;
      analysis += `This might be because the user's request wasn't specific enough or the information couldn't be extracted correctly.`;
    }
  } else if (errorType === 'runtime') {
    analysis = `The ${failedStep.step.type === 'component' ? 'component' : 'function'} encountered a problem while trying to execute. `;
    analysis += `This could be because the requested data isn't available, the operation isn't possible right now, or there's a temporary issue.`;
  } else if (errorType === 'component_render') {
    analysis = `The component couldn't be displayed. `;
    analysis += `This might be because some required information is missing or the component needs different information than what was provided.`;
  } else {
    analysis = `Something went wrong while trying to ${stepDescription || 'complete the action'}. `;
    analysis += `The user's request might need to be more specific or rephrased.`;
  }

  if (userMessage) {  
    analysis += `\n\nThe user's request was: "${userMessage}". Consider this context when suggesting how they can rephrase or provide more information.`;
  }
  
  return analysis;
}

async function buildErrorHandlingPrompt(
  request: ErrorHandlingRequest,
  context: Record<string, any>,
  config: AutoUIConfig,
): Promise<string> {
  const { userMessage, plan, executedSteps, failedStep } = request;
  
  const planFunctionNames = new Set<string>();
  const planComponentNames = new Set<string>();
  
  plan.steps.forEach(step => {
    if (step.type === 'function') {
      planFunctionNames.add(step.name);
    } else if (step.type === 'component') {
      planComponentNames.add(step.name);
    }
  });

  const functionConfigs: string[] = [];
  const componentConfigs: string[] = [];
  
  formatFunctionConfigsForErrorHandling(planFunctionNames, functionConfigs, config);
  await formatComponentCallbacks(planComponentNames, componentConfigs, config);
  
  const { stepDescription, stepName } = formatFailedStepInfo(failedStep, config);
  
  const { getRuntimeSchemaAsync } = await import('@lib/utils/validation/runtimeSchemaValidator');
  const runtimeSchema = await getRuntimeSchemaAsync(config);
  
  const functionSchemas = await formatFunctionSchemasForErrorHandling(
    planFunctionNames,
    runtimeSchema,
  );
  
  const componentSchemas = formatComponentSchemasForErrorHandling(
    planComponentNames,
    config,
    runtimeSchema,
  );
  
  const executedStepsDetails = formatExecutedStepsForErrorHandling(executedSteps);
  const errorAnalysis = analyzeErrorContext(failedStep, stepDescription, userMessage);
  
  const formattedFunctions = functionConfigs.length > 0 
    ? functionConfigs.map((funcConfig) => {
        const funcName = funcConfig.split(':')[0];
        const schema = functionSchemas.find(s => s.includes(`FUNCTION "${funcName}"`));
        return `${funcConfig}${schema ? `\n\n  Type Schema:\n${schema.split('\n').map(line => `  ${line}`).join('\n')}` : ''}`;
      }).join('\n\n')
    : '  (none)';
  
  const formattedComponents = componentConfigs.length > 0
    ? componentConfigs.map((compConfig) => {
        const compName = compConfig.split(':')[0];
        const schema = componentSchemas.find(s => s.includes(`COMPONENT "${compName}"`));
        return `${compConfig}${schema ? `\n\n  Type Schema:\n${schema.split('\n').map(line => `  ${line}`).join('\n')}` : ''}`;
      }).join('\n\n')
    : '  (none)';
  
  return `You are an error handling assistant for an AutoUI application. A step in the instruction plan has failed.

USER'S ORIGINAL REQUEST: "${userMessage}"

WHAT THE USER WAS TRYING TO DO:
The user wanted to: ${stepDescription || 'perform an action'}
Failed step: ${stepName}

WHAT ACTUALLY HAPPENED:
${errorAnalysis}

ORIGINAL PLAN:
${JSON.stringify(plan, null, 2)}

SUCCESSFULLY EXECUTED STEPS (${executedSteps.length}):
${executedStepsDetails || '  (none)'}

FAILED STEP DETAILS:
Type: ${failedStep.step.type}
Name: ${stepName}
Description: ${stepDescription}
Step Details:
${JSON.stringify(failedStep.step, null, 2)}

ERROR TYPE: ${failedStep.errorType}
SPECIFIC ERROR (for context only - DO NOT mention technical details to the user):
${failedStep.errors.map(e => `  - ${e}`).join('\n')}

CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}

${failedStep.props ? `ATTEMPTED PROPS/PARAMS:\n${JSON.stringify(failedStep.props, null, 2)}\n` : ''}

AVAILABLE FUNCTIONS IN PLAN (with descriptions and type schemas):
${formattedFunctions}

AVAILABLE COMPONENTS IN PLAN (with descriptions and type schemas):
${formattedComponents}

YOUR TASK:
Analyze what went wrong and provide a helpful response to the user.

1. If the error can be fixed by modifying the plan, return a newInstructionPlan that:
   - Keeps all successfully executed steps (they should not be repeated)
   - Modifies or replaces the failed step with corrected information
   - Continues with the remaining steps if applicable
   - For component steps: Use the "callbacks" field to specify callback handlers, or pass callback names in props
     * Format: { "callbacks": { "onAction": "callbackName" } } or props: { "onAddToCart": "addToCart" }
     * Use callback names from "Available Callbacks" listed in component configs above
   - When providing a newInstructionPlan, ALSO provide a fallbackSuggestion message that will be shown if the retry also fails

2. If the error cannot be fixed by retrying, return an errorMessage and set shouldRetry to false.

CRITICAL REQUIREMENTS for errorMessage and fallbackSuggestion:
- MUST be completely non-technical - never mention "validation", "props", "parameters", "schema", "type", "undefined", or any technical terms
- MUST specifically describe what you were trying to do for the user in plain language (e.g., "I couldn't show you the data", "I couldn't point to that element", "I couldn't load the information")
- MUST explain what went wrong in simple, user-friendly terms based on the error analysis above
- MUST provide specific, actionable suggestions that relate directly to what the user asked for
- MUST use the user's original request context to make suggestions relevant
- The suggestions should help the user understand what information they need to provide or how to rephrase their request
- fallbackSuggestion should be a smart, human-readable message explaining what the user should probably change if the retry also fails

EXAMPLES OF GOOD ERROR MESSAGES (generic patterns):
- User asked to display data but required information is missing:
  Message: "I couldn't show you that information because I don't have access to the data right now. Could you ask me to load it first? For example, you could say 'show me all items' or 'load the data'."

- User asked to point to something but target is unclear:
  Message: "I couldn't point to that for you because I need to know exactly which element you're referring to. Could you be more specific? For example, you could say 'show me where the filters are' or 'point to the button'."

- User asked to load filtered data but request is unclear:
  Message: "I couldn't load that for you. Could you try rephrasing your request? For example, you could say 'show me items matching X' or 'find items with Y property'."

- User asked to save/create but details are missing:
  Message: "I couldn't save that because I need more details. What would you like to name it? You could say something like 'save an item called X' or 'create an item for Y'."

BAD EXAMPLES (DO NOT DO THIS):
- "Validation failed: required prop 'tasks' is missing" (too technical)
- "I couldn't complete that action" (too vague)
- "An error occurred" (not helpful)
- "The component requires a 'target' parameter" (too technical)

3. Optionally, you can modify the context if needed by providing modifiedContext.

Response format (JSON):
{
  "newInstructionPlan": { ... } | null,
  "errorMessage": "string" | null,
  "shouldRetry": boolean,
  "modifiedContext": { ... } | null,
  "fallbackSuggestion": "string" | null
}

Important:
- If you provide a newInstructionPlan, set shouldRetry to true AND provide a fallbackSuggestion
- If you provide only an errorMessage, set shouldRetry to false
- The errorMessage and fallbackSuggestion MUST be user-friendly, helpful, and guide the user forward
- ALWAYS mention the specific action that failed in plain language
- ALWAYS include suggestions or questions in error messages - never just state what went wrong
- NEVER use technical terms - translate everything to user-friendly language
- Do not include steps that were already successfully executed in the newInstructionPlan`;
}

