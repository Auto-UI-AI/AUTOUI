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
   Examples of referencing intent:
   - "what did I ask before?"
   - "based on what I said earlier"
   - "those tasks you showed previously"
   - follow-up questions that clearly depend on prior answers

2. If (and ONLY IF) the USER MESSAGE shows clear intent to reference prior messages:
   - Use PREVIOUS MESSAGES as authoritative context
   - Resolve ambiguity by carefully analyzing message order and meaning
   - Prefer user messages over assistant messages when interpreting intent
   - Detect corrections, dissatisfaction, or clarifications in follow-ups

3. If the USER MESSAGE does NOT reference prior messages:
   - IGNORE previous messages completely
   - Do NOT infer hidden intent
   - Base analysis strictly on USER MESSAGE + INPUT DATA only

4. NEVER reuse previous context by default.
   Context usage must be INTENT-DRIVEN, not convenience-driven.

5. When context is used:
   - Identify what the user originally asked
   - Identify how the current message modifies, corrects, or narrows that request
   - Detect mistakes or over-broad previous assistant responses
   - Produce a refined, corrected interpretation

6. Be extremely precise:
   - Do NOT overgeneralize
   - Do NOT include unrelated data
   - Do NOT assume the assistant was correct previously

STRICT OUTPUT RULES:
- "parseTo" MUST be exactly "${parseTo}"
- "data" MUST strictly conform to the expected schema
- Do NOT add any extra fields
- Output MUST be directly consumable by the next step

PREVIOUS MESSAGE SLICE (USE ONLY IF INTENT REQUIRES IT):
${prevMessagesForContext}

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
