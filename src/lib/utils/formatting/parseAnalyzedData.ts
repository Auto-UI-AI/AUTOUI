export function parseAnalyzedData(content: any) {
  if (content == null) {
    throw new Error('Invalid LLM response: null or undefined');
  }
  
  if (typeof content === 'string') {
    let contentStr = content;
    const codeBlockMatch = contentStr.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (codeBlockMatch) {
      contentStr = codeBlockMatch[1].trim();
    }
    
    try {
      content = JSON.parse(contentStr);
    } catch (e) {
      throw new Error(`Invalid LLM response: content is a string but not valid JSON: ${content.substring(0, 100)}`);
    }
  }
  
  if (typeof content !== 'object' || Array.isArray(content)) {
    throw new Error(`Invalid LLM response: expected object but got ${typeof content}${Array.isArray(content) ? ' (array)' : ''}`);
  }

  const { parseTo, data, newInstructionPlan } = content;

  if (data === undefined) {
    throw new Error('Invalid LLM response: missing data field');
  }

  let extractedData: any;

  if (parseTo === 'array') {
    if (Array.isArray(data)) {
      extractedData = data;
    } else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const values = Object.values(data);
      if (values.length !== 1) {
        throw new Error(
          `LLM data object must contain exactly one value when parseTo is 'array', got ${values.length}`
        );
      }
      extractedData = values[0];
      if (!Array.isArray(extractedData)) {
        throw new Error(`Expected array but got ${typeof extractedData}`);
      }
    } else {
      throw new Error(`Expected array or object containing array, got ${typeof data}`);
    }
  } else if (parseTo === 'object') {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      throw new Error(`Expected object but got ${Array.isArray(data) ? 'array' : typeof data}`);
    }

    const values = Object.values(data);

    if (values.length !== 1) {
      throw new Error(
        `LLM data object must contain exactly one value when parseTo is 'object', got ${values.length}`
      );
    }

    extractedData = values[0];
  } else {  
    extractedData = data;
  }

  return {
    parseTo: parseTo ?? 'primitive',
    data: extractedData,
    newInstructionPlan: newInstructionPlan ?? null,
  };
}
