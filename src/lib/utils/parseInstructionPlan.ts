export function parseInstructionPlan(raw: unknown): any {
  // If it's already an object, just return it
  if (raw && typeof raw === "object") {
    return raw;
  }

  if (typeof raw !== "string") {
    throw new Error("Plan must be a string or object");
  }

  let text = raw.trim();

  // 1) Strip markdown code fences like ```json ... ```
  //    - leading ```json or ```JSON or ``` ...
  text = text.replace(/^```[a-zA-Z]*\s*/i, "");
  //    - trailing ```
  text = text.replace(/```$/, "").trim();

  // 2) Try a direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // continue to more aggressive cleaning
  }

  // 3) Extract substring between the first '{' and last '}'
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    let inner = text.slice(firstBrace, lastBrace + 1).trim();

    // 3a) Remove trailing commas before } or ]
    //     e.g.  "..., }" -> "... }"
    inner = inner.replace(/,\s*([}\]])/g, "$1");

    try {
      return JSON.parse(inner);
    } catch (err) {
      console.error("❌ Still failed to parse cleaned plan JSON:", inner, err);
      throw new Error("Invalid plan format: could not parse JSON even after cleanup");
    }
  }

  throw new Error("Invalid plan format: no JSON object found");
}