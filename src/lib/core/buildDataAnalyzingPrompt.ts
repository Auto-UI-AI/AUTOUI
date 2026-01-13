import type { AutoUIConfig } from "@lib/types";
import type { InstructionPlan, InstructionStep } from "@lib/types/llmTypes";
import { retrieveRuntimeSchemasForPrompt } from "../utils/formatting/retrieveRuntimeSchemas";
import { formatDataPreviewForPrompt } from "@lib/utils/formatting/formatDataPreviewForPrompt";

export const buildDataAnalyzingPrompt = async (
  data: unknown,
  config: AutoUIConfig,
  userMessage: string,
  prevMessagesForContext: string,
  plan: InstructionPlan,
  _currentStep: InstructionStep,
  currentStepIndex: number,
  expectedSchema: {
    parseTo: "array" | "object" | "primitive";
    schema: unknown;
  } | null
): Promise<string> => {
  const parseTo = expectedSchema?.parseTo ?? "primitive";

  const remainingSteps = plan.steps.slice(currentStepIndex + 1);
  const relevantPlan = {
    type: plan.type,
    steps: remainingSteps,
  };

  const schemaBlock = expectedSchema && expectedSchema.parseTo !== "primitive"
    ? JSON.stringify(expectedSchema.schema, null, 2)
    : null;

  let dataPreview = formatDataPreviewForPrompt(data);

  const usePrevMessages = prevMessagesForContext && prevMessagesForContext.length > 0 && prevMessagesForContext.length < 500;

  const componentNames = new Set<string>();
  const functionNames = new Set<string>();
  
  remainingSteps.forEach(step => {
    if (step.type === 'component') {
      componentNames.add(step.name);
    } else if (step.type === 'function') {
      functionNames.add(step.name);
    }
  });

  let schemaInfo = await retrieveRuntimeSchemasForPrompt(componentNames, functionNames, config);

  return `You are AutoUI Data Analyzer. Analyze function output and refine downstream steps.

RULES:
1. Return ONLY JSON: { "parseTo": "${parseTo}", "data": <value>, "newInstructionPlan": <plan|null> }
2. "data" MUST match expected schema (preserve structure for arrays/objects)
3. "newInstructionPlan" is null by default - only set if downstream steps need refinement
4. Only modify steps AFTER the data-consuming step
5. Keep structured data intact - use text steps for explanations

CRITICAL: FILTER AND TRANSFORM DATA BASED ON USER INTENT
- If the user requests SPECIFIC/FILTERED data (e.g., "tasks related to food", "items with status X", "tasks matching Y"), 
  you MUST filter/transform the data array/object to only include matching items BEFORE returning it in the "data" field.
- The "data" field should contain the FILTERED/TRANSFORMED data that matches what the user asked for.
- Do NOT return all data if the user asked for a subset - filter it first.
- Examples:
  * User: "tasks related to food" → Filter array to only tasks with food-related titles
  * User: "high priority items" → Filter array to only items with priority="high"
  * User: "completed tasks" → Filter array to only tasks with status="done"
- If the user asks for ALL/COMPLETE data without filters, return the data as-is.

CONTEXT:
User: "${userMessage}"
${usePrevMessages ? `Previous: ${prevMessagesForContext.substring(0, 300)}` : ''}

REMAINING STEPS (modify only these):
${JSON.stringify(relevantPlan, null, 2)}

FUNCTION OUTPUT:
${JSON.stringify(dataPreview, null, 2)}
${schemaBlock ? `\nEXPECTED SCHEMA:\n${schemaBlock}` : ''}
${schemaInfo}

CRITICAL RULES FOR newInstructionPlan:
- When modifying component props, use ONLY the props listed above for that component
- When modifying function params, use ONLY the params listed above for that function
- DO NOT create props/params that don't exist in the schema above
- Use context variables ({{contextKey}}) to reference data from previous steps
- If a component requires a prop (marked as required), you MUST include it in the props object
- For component callbacks: Use the "callbacks" field to specify callback handlers, or pass callback names in props
  - Format: { "callbacks": { "onAction": "callbackName" } } or props: { "onAddToCart": "addToCart" }
  - Use callback names from "AVAILABLE CALLBACKS" listed above
- Example: If TaskStats requires "tasks" prop, use: { "tasks": "{{tasks}}" } NOT { "filter": "food" }
- Example: If ProductCard has "addToCart" callback, use: { "callbacks": { "onAction": "addToCart" } } or props: { "onAddToCart": "addToCart" }

Return JSON only.`.trim();
};
