export const parseAnalyzedData = (res: unknown) => {
  if (typeof res !== "string") {
    throw new Error("Analyzed data must be a JSON string");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(res);
  } catch {
    throw new Error("LLM returned invalid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Analyzed data must be an object");
  }

  if (!("parseTo" in parsed) || !("data" in parsed)) {
    throw new Error("Missing parseTo or data fields");
  }

  switch (parsed.parseTo) {
    case "array":
      if (!Array.isArray(parsed.data)) {
        throw new Error("Expected array data");
      }
      return parsed.data;

    case "object":
      if (typeof parsed.data !== "object") {
        throw new Error("Expected object data");
      }
      return parsed.data;

    case "primitive":
      return parsed.data;

    default:
      throw new Error(`Unknown parseTo: ${parsed.parseTo}`);
  }
};

