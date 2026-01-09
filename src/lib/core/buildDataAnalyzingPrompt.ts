import type { AutoUIConfig } from "@lib/types";
import type { InstructionPlan, InstructionStep } from "@lib/types/llmTypes";

export const buildDataAnalyzingPrompt = (
  data: unknown,
  _config: AutoUIConfig,
  userMessage: string,
  prevMessagesForContext: string,
  plan: InstructionPlan,
  currentStep: InstructionStep,
  currentStepIndex: number,
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

You are invoked EXACTLY ONCE immediately AFTER a function step
has executed and returned real data.

Your job is NOT to replan the entire flow.
Your job is to perform a SINGLE, FINAL refinement of downstream steps
based on real data.

You MUST NOT cause another analysis cycle.

────────────────────────────────────────
EXECUTION CONTEXT (NON-NEGOTIABLE)
────────────────────────────────────────

- The CURRENT step (${currentStep}) has ALREADY executed.
- ALL steps BEFORE and INCLUDING the current step at index:${currentStepIndex} are FINAL and IMMUTABLE.
- The IMMEDIATE NEXT step consumes the output of the current step.
- You are ONLY allowed to modify steps that come AFTER that consumer step.

You may update text, presentation, or structure ONLY in that suffix.

────────────────────────────────────────
OUTPUT FORMAT (STRICT)
────────────────────────────────────────

You MUST return ONLY valid JSON.
No explanations. No markdown. No comments.

RESPONSE SCHEMA (MANDATORY):
{
  "parseTo": "${parseTo}",
  "data": <JSON value>,
  "newInstructionPlan": <InstructionPlan | null>
}

────────────────────────────────────────
CRITICAL THINKING RULES
────────────────────────────────────────

1. Determine whether the USER MESSAGE explicitly or implicitly
   references previous conversation history.

2. Use PREVIOUS MESSAGES ONLY if such intent exists.
   Otherwise IGNORE them completely.

3. Prefer USER messages over assistant messages at all times.

4. Do NOT infer new goals.
   Do NOT hallucinate intent.
   Do NOT overgeneralize.

────────────────────────────────────────
DATA HANDLING RULES (VERY IMPORTANT)
────────────────────────────────────────

5. Your PRIMARY responsibility is to produce "data" that can be
   consumed by the NEXT step in the CURRENT plan.

6. If EXPECTED DATA SHAPE FOR NEXT STEP is provided:
   - "data" MUST conform EXACTLY to that schema.
   - The STRUCTURE and TYPE of the data MUST be preserved.
   - If the schema is satisfied, the plan is considered VALID.

CRITICAL DATA CONTRACT (NON-NEGOTIABLE):

7. If the NEXT step consumes STRUCTURED data
   (e.g. arrays or objects passed to components):

   - You MUST NOT replace structured data with text or prose.
   - You MUST NOT summarize, explain, or narrate inside "data".
   - You MUST preserve arrays and objects exactly as required.

8. If the user requests explanation, reasoning, or description:
   - Keep "data" STRUCTURED and UNCHANGED.
   - Express explanations ONLY via text steps
     using "newInstructionPlan".

Returning text when structured data is expected is STRICTLY FORBIDDEN.

────────────────────────────────────────
PLAN REFINEMENT MODEL (VERY IMPORTANT)
────────────────────────────────────────

9. "newInstructionPlan" MUST be null by default.

10. You may generate "newInstructionPlan" ONLY ONCE
    and ONLY if real data REQUIRES downstream refinement.

11. Refinement is LIMITED to steps AFTER the data-consuming step.
    You MUST NOT:
    - Modify the current function step
    - Modify any step before it
    - Modify the immediate data-consuming step
    - Re-add any function with hasToShareDataWithLLM = true

12. CONTENT-FIRST STRATEGY (DEFAULT):
    - Prefer updating existing text steps
    - Prefer editing text content over adding steps
    - Structural changes are a LAST resort

13. STRUCTURAL CHANGES ARE ALLOWED ONLY IF:
    - The user explicitly requests explanation, reasoning, or comparison
    - The existing plan cannot express the requested output

14. FORBIDDEN ACTIONS:
    - Re-introducing analysis
    - Returning a plan that could trigger another refinement
    - Returning a plan identical to the previous one
    - Re-running already executed steps

15. FINALITY RULE:
    If you return "newInstructionPlan":
    - It MUST be FINAL
    - It MUST be executable in ONE pass
    - It MUST NOT require further analysis

────────────────────────────────────────
FINAL INTERNAL CHECK (MANDATORY)
────────────────────────────────────────

Before returning a non-null "newInstructionPlan", ask internally:

"Did I keep structured data intact
and move explanations into text steps?"

If not → FIX IT.

────────────────────────────────────────
STRICT OUTPUT RULES
────────────────────────────────────────

- "parseTo" MUST be exactly "${parseTo}"
- "data" MUST match the expected schema
- "newInstructionPlan" MUST be InstructionPlan or null
- Do NOT add any extra fields

────────────────────────────────────────
REFERENCE CONTEXT (READ-ONLY)
────────────────────────────────────────

PREVIOUS MESSAGE SLICE:
${prevMessagesForContext}

LAST USER MESSAGE:
"${userMessage}"

CURRENT INSTRUCTION PLAN:
${JSON.stringify(plan, null, 2)}

CURRENT STEP (ALREADY EXECUTED):
${currentStep} at index:${currentStepIndex} in the instruction plan

INPUT DATA:
${JSON.stringify(data, null, 2)}

EXPECTED DATA SHAPE FOR NEXT STEP:
${schemaBlock}

Return ONLY the JSON object described above.
`.trim();
};
