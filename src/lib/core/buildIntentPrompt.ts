import type { AutoUIConfig } from '../types';

export function buildIntentPrompt(userMessage: string, config: AutoUIConfig) {
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

  // A very explicit contract the model must follow
  const system = `You are AutoUI Intent Planner.
Return ONLY a valid JSON InstructionPlan and nothing else.
Do not wrap in markdown fences. Do not include any fields outside the schema.

SCHEMA (must match exactly):
{
  "type": "sequence",
  "steps": [
    { "type": "function", "name": "<function name>", "params": { /* optional */ }, "assign": "<ctxKey>", "hasToShareDataWithLLM": true|false },
    { "type": "component", "name": "<component name>", "props": { /* optional, may reference {{ctxKey}} */ } }
     { "type": "text", "text": "<actual generated text>"} }
  ]
}

RULES:
- "type" must be exactly "sequence".
- "steps" must be a non-empty array.
- Use ONLY declared function/component names from the lists below.
- If a component needs data, call a function first and save it under an "assign" key, then reference it in props via "{{assignKey}}".
- Do not add "intent", "explanations", or any keys not in the schema.
- Output a single JSON object (no arrays or strings at top-level).

${config.llm.appDescriptionPrompt && `Here is the description of the current app using AUTOUI library made by developer so that you would know the context of what your answers must be about. If userMessages are not related to that description below then inform user that you can only answer questions related to this current website: ${config.llm.appDescriptionPrompt} ${config.metadata?.appName}`}
`;

  const example = `VALID EXAMPLE:
{
  "type": "sequence",
  "steps": [
    { "type": "function", "name": "fetchProducts", "params": { "color": "red" }, "assign": "items", hasToShareDataWithLLM: true },
    { "type": "component", "name": "ProductList", "props": { "products": "{{items}}", "onAddToCart": "addToCart" } }
    { "type": "text", "text": "Here is the product list we found for you" }
  ]
}`;

  return [
    system,
    '',
    'Available functions:',
    funcLines.join('\n\n'),
    '',
    'Available components:',
    compLines.join('\n\n'),
    '',
    example,
    '',
    `USER MESSAGE: "${userMessage}"`,
    '',
    'Respond with ONLY the plan JSON (no code fences, no commentary).',
  ].join('\n');
}
