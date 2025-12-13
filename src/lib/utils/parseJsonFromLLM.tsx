export default function parseJsonFromLLM<T = unknown>(raw: unknown): T {
  // If it's already an object/array, just return it
  if (raw && typeof raw === "object") {
    return raw as T;
  }

  if (typeof raw !== "string") {
    throw new Error("LLM JSON must be a string or object");
  }

  let text = raw.trim();

  // 1) Strip leading/trailing code fences like ```json ... ```
  //    Leading fence: ``` or ```json or ```JSON etc.
  if (text.startsWith("```")) {
    // remove first line (``` or ```json)
    const firstNewline = text.indexOf("\n");
    if (firstNewline !== -1) {
      text = text.slice(firstNewline + 1);
    }
  }
  if (text.endsWith("```")) {
    text = text.slice(0, text.lastIndexOf("```"));
  }
  text = text.trim();

  // 2) Try direct JSON.parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    // continue to more aggressive cleaning
  }

  // 3) Extract substring between first `{` or `[` and last `}` or `]`
  const firstBrace = Math.min(
    ...[text.indexOf("{"), text.indexOf("[")].filter((i) => i !== -1),
  );
  const lastBrace = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    let inner = text.slice(firstBrace, lastBrace + 1).trim();

    // 3a) Remove trailing commas before } or ]
    //     e.g.  "..., }" -> "... }"
    inner = inner.replace(/,\s*([}\]])/g, "$1");

    try {
      return JSON.parse(inner) as T;
    } catch (err) {
      console.error("❌ Still failed to parse cleaned LLM JSON:", inner, err);
      throw new Error("Invalid JSON from LLM even after cleanup");
    }
  }

  throw new Error("Invalid JSON from LLM: no JSON object/array found");
}