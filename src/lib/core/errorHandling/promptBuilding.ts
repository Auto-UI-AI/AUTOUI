import type { AutoUIConfig } from '@lib/types';
import { formatComponentCallbacks } from '@lib/utils/formatting/formatComponentCallbacks';
import { formatFunctionConfigsForErrorHandling } from '@lib/utils/formatting/formatFunctionConfigsForErrorHandling';
import { formatFunctionSchemasForErrorHandling } from '@lib/utils/formatting/formatFunctionSchemasForErrorHandling';
import { formatComponentSchemasForErrorHandling } from '@lib/utils/formatting/formatComponentSchemasForErrorHandling';
import { formatExecutedStepsForErrorHandling } from '@lib/utils/formatting/formatExecutedStepsForErrorHandling';
import { formatFailedStepInfo } from '@lib/utils/formatting/formatFailedStepInfo';
import type { ErrorHandlingRequest, StepExecutionError } from '@lib/types/errorHandlingTypes';
import { analyzeErrorContext } from './errorAnalysis';

export function extractPlanStepNames(plan: ErrorHandlingRequest['plan']): {
  functionNames: Set<string>;
  componentNames: Set<string>;
} {
  const functionNames = new Set<string>();
  const componentNames = new Set<string>();
  
  plan.steps.forEach(step => {
    if (step.type === 'function') {
      functionNames.add(step.name);
    } else if (step.type === 'component') {
      componentNames.add(step.name);
    }
  });
  
  return { functionNames, componentNames };
}

export function formatFunctionsWithSchemas(
  functionConfigs: string[],
  functionSchemas: string[],
): string {
  if (functionConfigs.length === 0) {
    return '  (none)';
  }
  
  return functionConfigs.map((funcConfig) => {
    const funcName = funcConfig.split(':')[0];
    const schema = functionSchemas.find(s => s.includes(`FUNCTION "${funcName}"`));
    return schema
      ? `${funcConfig}\n\n  Type Schema:\n${schema.split('\n').map(line => `  ${line}`).join('\n')}`
      : funcConfig;
  }).join('\n\n');
}

export function formatComponentsWithSchemas(
  componentConfigs: string[],
  componentSchemas: string[],
): string {
  if (componentConfigs.length === 0) {
    return '  (none)';
  }
  
  return componentConfigs.map((compConfig) => {
    const compName = compConfig.split(':')[0];
    const schema = componentSchemas.find(s => s.includes(`COMPONENT "${compName}"`));
    return schema
      ? `${compConfig}\n\n  Type Schema:\n${schema.split('\n').map(line => `  ${line}`).join('\n')}`
      : compConfig;
  }).join('\n\n');
}

export async function buildErrorHandlingPrompt(
  request: ErrorHandlingRequest,
  context: Record<string, any>,
  config: AutoUIConfig,
): Promise<string> {
  const { userMessage, plan, executedSteps, failedStep } = request;
  
  const { functionNames, componentNames } = extractPlanStepNames(plan);
  
  const functionConfigs: string[] = [];
  const componentConfigs: string[] = [];
  
  formatFunctionConfigsForErrorHandling(functionNames, functionConfigs, config);
  await formatComponentCallbacks(componentNames, componentConfigs, config);
  
  const { stepDescription, stepName } = formatFailedStepInfo(failedStep, config);
  
  const { getRuntimeSchemaAsync } = await import('@lib/utils/validation/runtimeSchemaValidator');
  const runtimeSchema = await getRuntimeSchemaAsync(config);
  
  const functionSchemas = await formatFunctionSchemasForErrorHandling(
    functionNames,
    runtimeSchema,
  );
  
  const componentSchemas = formatComponentSchemasForErrorHandling(
    componentNames,
    config,
    runtimeSchema,
  );
  
  const executedStepsDetails = formatExecutedStepsForErrorHandling(executedSteps);
  const errorAnalysis = analyzeErrorContext(failedStep, stepDescription, userMessage);
  
  const formattedFunctions = formatFunctionsWithSchemas(functionConfigs, functionSchemas);
  const formattedComponents = formatComponentsWithSchemas(componentConfigs, componentSchemas);
  
  return buildPromptTemplate({
    userMessage,
    stepDescription,
    stepName,
    errorAnalysis,
    plan,
    executedSteps,
    executedStepsDetails,
    failedStep,
    context,
    formattedFunctions,
    formattedComponents,
  });
}

function buildPromptTemplate(params: {
  userMessage: string;
  stepDescription: string;
  stepName: string;
  errorAnalysis: string;
  plan: ErrorHandlingRequest['plan'];
  executedSteps: ErrorHandlingRequest['executedSteps'];
  executedStepsDetails: string;
  failedStep: StepExecutionError;
  context: Record<string, any>;
  formattedFunctions: string;
  formattedComponents: string;
}): string {
  const {
    userMessage,
    stepDescription,
    stepName,
    errorAnalysis,
    plan,
    executedSteps,
    executedStepsDetails,
    failedStep,
    context,
    formattedFunctions,
    formattedComponents,
  } = params;

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
Analyze what went wrong and provide helpful responses. You MUST always provide a user-friendly fallbackSuggestion that will be shown in the chat.

IMPORTANT DISTINCTION:
- fallbackSuggestion: This is what the USER will see in the chat. It must be completely user-friendly, non-technical, and helpful.
- errorMessage: This is what DEVELOPERS will see in the console for debugging. It can include technical details to help developers understand what went wrong.

1. If the error can be fixed by modifying the plan:
   - Return a newInstructionPlan that:
     * Keeps all successfully executed steps (they should not be repeated)
     * Modifies or replaces the failed step with corrected information
     * Continues with the remaining steps if applicable
     * For component steps: Use the "callbacks" field to specify callback handlers, or pass callback names in props
       - Format: { "callbacks": { "onAction": "callbackName" } } or props: { "onAddToCart": "addToCart" }
       - Use callback names from "Available Callbacks" listed in component configs above
   - Set shouldRetry to true
   - ALWAYS provide a fallbackSuggestion message that will be shown to the user if the retry also fails
   - OPTIONALLY provide an errorMessage for developers to debug (can include technical details)
   - The fallbackSuggestion should explain what might need to change if the retry fails in user-friendly terms

2. If the error cannot be fixed by retrying:
   - ALWAYS provide a fallbackSuggestion that explains what went wrong in user-friendly language
   - OPTIONALLY provide an errorMessage for developers (can include technical details for debugging)
   - Set shouldRetry to false

CRITICAL REQUIREMENTS for fallbackSuggestion (this is what the USER will see in chat):
- MUST be completely non-technical - never mention "validation", "props", "parameters", "schema", "type", "undefined", "error", "failed", or any technical terms
- MUST specifically describe what you were trying to do for the user in plain language (e.g., "I couldn't show you the data", "I couldn't point to that element", "I couldn't load the information")
- MUST explain what went wrong in simple, user-friendly terms WITHOUT exposing any technical details
- MUST provide specific, actionable suggestions that relate directly to what the user asked for
- MUST use the user's original request context to make suggestions relevant
- The suggestions should help the user understand what information they need to provide or how to rephrase their request
- NEVER reference the technical error details shown above - translate everything into user-friendly language

REQUIREMENTS for errorMessage (this is what DEVELOPERS will see in console for debugging):
- Can include technical details to help developers understand what went wrong
- Should reference validation errors, missing props, schema issues, etc. if helpful for debugging
- Should be informative enough for developers to diagnose and fix the issue
- This will NOT be shown to users, only logged to console

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
- If you cannot retry, set shouldRetry to false AND provide a fallbackSuggestion
- The fallbackSuggestion MUST be user-friendly, helpful, and guide the user forward
- The errorMessage is optional but helpful for developers - it can include technical details
- ALWAYS provide a fallbackSuggestion (this is what users see)
- ALWAYS mention the specific action that failed in plain language in fallbackSuggestion
- ALWAYS include suggestions or questions in fallbackSuggestion - never just state what went wrong
- NEVER use technical terms in fallbackSuggestion - translate everything to user-friendly language
- Do not include steps that were already successfully executed in the newInstructionPlan`;
}

