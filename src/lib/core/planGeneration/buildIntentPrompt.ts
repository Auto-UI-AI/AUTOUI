import { formatFuncsForPrompt } from '@lib/utils/formatting/formatFuncsForPrompt';
import type { AutoUIConfig } from '../../types';
import { formatCompsForPrompt } from '@lib/utils/formatting/formatCompsForPrompt';
import { formatAppDescForPrompt } from '@lib/utils/formatting/formatAppDescForPrompt';

export function buildIntentPrompt(
  userMessage: string,
  config: AutoUIConfig,
  prevMessagesForContext: string
) {
  const funcLines = formatFuncsForPrompt(config);
  const compLines = formatCompsForPrompt(config);
  const appContext = formatAppDescForPrompt(config);

  return `You are an Intent Planner. Analyze available functions/components, user message, and message history to create an InstructionPlan.

OUTPUT SCHEMA:
{
  "type": "sequence",
  "steps": [
    {
      "type": "function",
      "name": "<function name>",
      "params": { /* required if function has params */ },
      "assign": "<contextKey>",
      "hasToShareDataWithLLM": true | false
    },
    {
      "type": "component",
      "name": "<component name>",
      "props": { /* may reference {{contextKey}} */ },
      "callbacks": { /* optional: explicitly map callback props to callback names */ }
    },
    {
      "type": "text",
      "text": "<message>"
    }
  ]
}

RULES:
1. Analyze user message + history to understand intent. Use history ONLY if message references prior conversation.
2. If function has params listed, they are REQUIRED. Chain functions if needed: call data-fetching function first, assign result, then use {{contextKey}} in params.
   IMPORTANT: When a function requires a param that should come from a previous step's assign key, use {{contextKey}} syntax in the params object.
   Example: If step 1 has assign: "tasks", and step 2 function needs "tasks" param, use params: { "tasks": "{{tasks}}" }
3. hasToShareDataWithLLM: Set to true if user requests FILTERED/SPECIFIC data (criteria, conditions, analysis, explanations) OR false if user wants ALL/COMPLETE data.
4. Extract component props from user message or use context variables. Function params can also use context variables with {{contextKey}} syntax.
5. For component callbacks: Use the "callbacks" field to explicitly specify which callback handlers to use. 
   - Format: { "onAction": "callbackName" } where callbackName matches a callback from "Available Callbacks"
   - You can also pass callback names directly in props (e.g., { "onAddToCart": "addToCart" })
   - The callbacks field takes precedence over props for callback resolution
6. Be minimal - only include necessary steps.
7. Return ONLY valid JSON, no markdown or comments.

${appContext}AVAILABLE FUNCTIONS:
${funcLines.join('\n\n')}

AVAILABLE COMPONENTS:
${compLines.join('\n\n')}

EXAMPLE 1:
User: "show tasks related to food"
{
  "type": "sequence",
  "steps": [
    {
      "type": "function",
      "name": "fetchTasks",
      "params": {},
      "assign": "tasks",
      "hasToShareDataWithLLM": true
    },
    {
      "type": "component",
      "name": "TasksList",
      "props": { "tasks": "{{tasks}}" }
    }
  ]
}
Note: hasToShareDataWithLLM: true because user requested filtered data (tasks "related to food").

EXAMPLE 2 (Function params using context):
User: "fetch tasks and then summarize them"
{
  "type": "sequence",
  "steps": [
    {
      "type": "function",
      "name": "fetchTasks",
      "params": {},
      "assign": "tasks",
      "hasToShareDataWithLLM": false
    },
    {
      "type": "function",
      "name": "summarizeTasks",
      "params": { "tasks": "{{tasks}}" },
      "assign": "summary"
    }
  ]
}
Note: The second function uses {{tasks}} in params to reference the assign key from the first step.

EXAMPLE 3 (Component with callbacks):
User: "show products and let me add them to cart"
{
  "type": "sequence",
  "steps": [
    {
      "type": "function",
      "name": "fetchProducts",
      "params": {},
      "assign": "products"
    },
    {
      "type": "component",
      "name": "ProductGallery",
      "props": { "products": "{{products}}" },
      "callbacks": { "onAddToCart": "addToCart" }
    }
  ]
}
Note: The callbacks field explicitly maps the onAddToCart prop to the "addToCart" callback handler.
Alternatively, you can use: props: { "onAddToCart": "addToCart" } or props: { "onAction": "addToCart" }

MESSAGE HISTORY:
${prevMessagesForContext || '(none)'}

CURRENT USER MESSAGE:
"${userMessage}"

Return InstructionPlan JSON:`.trim();
}
