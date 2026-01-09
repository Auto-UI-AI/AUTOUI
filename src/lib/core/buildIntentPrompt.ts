import type { AutoUIConfig } from '../types';

export function buildIntentPrompt(
  userMessage: string,
  config: AutoUIConfig,
  prevMessagesForContext: string
) {
  const funcLines = Object.entries(config.functions).map(([name, f]) => {
    const params = f.params
      ? Object.entries(f.params)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n')
      : '(no documented params)';
    return `FUNCTION ${name}:
Description: ${f.prompt}
Params:
${params}`;
  });

  const compLines = Object.entries(config.components).map(([name, c]) => {
    const props = c.props
      ? Object.entries(c.props)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n')
      : '(no documented props)';
    return `COMPONENT ${name}:
Description: ${c.prompt}
Props:
${props}`;
  });

  const system = `
You are AutoUI Intent Planner.

Your job is to convert the USER MESSAGE into a precise InstructionPlan.

You MUST return ONLY a valid JSON object matching the schema below.
Do NOT include markdown, comments, explanations, or extra fields.

SCHEMA (MUST MATCH EXACTLY):
{
  "type": "sequence",
  "steps": [
    {
      "type": "function",
      "name": "<function name>",
      "params": { /* optional */ },
      "assign": "<ctxKey>",
      "hasToShareDataWithLLM": true | false
    },
    {
      "type": "component",
      "name": "<component name>",
      "props": { /* optional, may reference {{ctxKey}} */ }
    },
    {
      "type": "text",
      "text": "<actual generated text>"
    }
  ]
}

CRITICAL PLANNING RULES (READ CAREFULLY):

1. FIRST, determine whether the USER MESSAGE explicitly or implicitly references prior conversation.
   Examples:
   - "what did I ask before?"
   - "those tasks you showed"
   - follow-up complaints or corrections
   - narrowing or clarifying earlier requests

2. Use PREVIOUS MESSAGES ONLY IF such intent exists.
   - If no reference intent is present, IGNORE previous messages entirely.
   - Never assume context relevance by default.

3. When previous messages ARE relevant:
   - Prefer USER messages over assistant messages
   - Detect corrections, dissatisfaction, or scope narrowing
   - Do NOT repeat earlier assistant mistakes
   - Generate a refined and corrected plan

4. When previous messages are NOT relevant:
   - Base the plan strictly on USER MESSAGE only

5. Be precise and minimal:
   - Do NOT overfetch data
   - Do NOT include unrelated functions or components
   - Do NOT create steps “just in case”

6. If data is required for rendering:
   - Call a function FIRST
   - Store result using "assign"
   - Reference it via "{{assignKey}}" in component props

7. If no function or component is appropriate:
   - Return a single "text" step

STRICT OUTPUT RULES:
- "type" must be exactly "sequence"
- "steps" must be non-empty
- Use ONLY declared function/component names
- Do NOT add any extra keys
- Output ONE JSON object at top level

${config.llm.appDescriptionPrompt && `
APPLICATION CONTEXT (IMPORTANT):
This app is built using AutoUI.
You must ONLY respond to requests related to this app.
If the USER MESSAGE is unrelated, respond with a single "text" step explaining the limitation.

App description:
${config.llm.appDescriptionPrompt}
App name:
${config.metadata?.appName}
`}
`.trim();

  const example = `
VALID EXAMPLE:
{
  "type": "sequence",
  "steps": [
    {
      "type": "function",
      "name": "fetchProducts",
      "params": { "color": "red" },
      "assign": "items",
      "hasToShareDataWithLLM": true
    },
    {
      "type": "component",
      "name": "ProductList",
      "props": { "products": "{{items}}" }
    },
    {
      "type": "text",
      "text": "Here are the red products we found for you."
    }
  ]
}
`.trim();

  return [
    system,
    '',
    'AVAILABLE FUNCTIONS:',
    funcLines.join('\n\n'),
    '',
    'AVAILABLE COMPONENTS:',
    compLines.join('\n\n'),
    '',
    example,
    '',
    'PREVIOUS MESSAGE SLICE (USE ONLY IF INTENT REQUIRES IT):',
    prevMessagesForContext,
    '',
    `USER MESSAGE: "${userMessage}"`,
    '',
    'Respond with ONLY the InstructionPlan JSON.',
  ].join('\n');
}
