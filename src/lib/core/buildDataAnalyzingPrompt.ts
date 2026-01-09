import type { AutoUIConfig } from "@lib/types";
import type { InstructionPlan } from "@lib/types/llmTypes";

export const buildDataAnalyzingPrompt = (
  data: unknown,
  _config: AutoUIConfig,
  userMessage: string,
  prevMessagesForContext: string,
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

Your task is to analyze INPUT DATA and produce structured output for the next step.

You MUST return ONLY valid JSON.
Do NOT include explanations, comments, markdown, or extra text.

RESPONSE SCHEMA (MANDATORY):
{
  "parseTo": "${parseTo}",
  "data": <JSON value>
}

CRITICAL THINKING RULES (VERY IMPORTANT):

1. FIRST, determine whether the USER MESSAGE explicitly or implicitly references previous conversation history.

2. If (and ONLY IF) previous messages are relevant:
   - Treat the MOST RECENT messages as having the HIGHEST importance.
   - Later messages OVERRIDE earlier ones.
   - User corrections, clarifications, or follow-ups in the last messages
     MUST take priority over older intent.
   - Never resurrect earlier intent that was implicitly corrected later.

3. Prefer USER messages over assistant messages at all times.
   Assistant messages may be incorrect or over-broad.

4. If the USER MESSAGE does NOT reference prior messages:
   - IGNORE previous messages completely.
   - Base analysis strictly on USER MESSAGE + INPUT DATA only.

5. NEVER reuse previous context by default.
   Context usage must be INTENT-DRIVEN and RECENCY-WEIGHTED.

6. When context is used:
   - Identify the latest user intent
   - Detect scope narrowing ("I mean", "actually", "only", "that one")
   - Detect dissatisfaction or correction
   - Produce a refined, corrected interpretation

7. Be extremely precise:
   - Do NOT overgeneralize
   - Do NOT include unrelated data
   - Do NOT summarize unless explicitly requested

STRICT OUTPUT RULES:
- "parseTo" MUST be exactly "${parseTo}"
- "data" MUST strictly conform to the expected schema
- Do NOT add any extra fields
- Output MUST be directly consumable by the next step

PREVIOUS MESSAGE SLICE (ORDERED FROM OLDEST → NEWEST, RECENCY MATTERS):
${prevMessagesForContext}

USER MESSAGE (HIGHEST PRIORITY):
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

