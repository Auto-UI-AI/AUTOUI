import type { AutoUIConfig } from "@lib/types";
import type { InstructionPlan } from "@lib/types/llmTypes";

export const buildDataAnalyzingPrompt = (
  data: unknown,
  _config: AutoUIConfig,
  userMessage: string,
  plan: InstructionPlan,
  currentStepName: string,
  expectedSchema: {
    parseTo: "array" | "object" | "primitive";
    schema: unknown;
  } | null
): string => {
  const parseTo = expectedSchema?.parseTo ?? "primitive";

  const schemaBlock = expectedSchema
    ? JSON.stringify(expectedSchema.schema, null, 2)
    : "Primitive value (string | number | boolean)";

  return `
You are AutoUI Data Analyzer.

You MUST return ONLY valid JSON.
Do NOT include explanations, comments, or markdown.

RESPONSE SCHEMA (MANDATORY):
{
  "parseTo": "${parseTo}",
  "data": <JSON value>
}

RULES:
- "parseTo" MUST be exactly "${parseTo}".
- "data" MUST strictly conform to the expected schema.
- Do NOT add any extra fields.
- Output MUST be directly consumable by the next step.

USER MESSAGE:
${userMessage}

CURRENT STEP:
${currentStepName}

INPUT DATA (JSON):
${JSON.stringify(data, null, 2)}

EXPECTED DATA SHAPE FOR NEXT STEP:
${schemaBlock}

Return ONLY the JSON object described above.
`.trim();
};
