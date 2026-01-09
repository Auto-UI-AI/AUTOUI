export function parseAnalyzedData(content: any) {
  if (!content || typeof content !== 'object') {
    throw new Error('Invalid LLM response: not an object');
  }

  const { parseTo, data, newInstructionPlan } = content;

  if (data === undefined) {
    throw new Error('Invalid LLM response: missing data');
  }

  let extractedData: any;

  if (parseTo === 'object' || parseTo === 'array') {
    if (typeof data !== 'object' || data === null) {
      throw new Error(`Expected ${parseTo} but got non-object`);
    }

    const values = Object.values(data);

    if (values.length !== 1) {
      throw new Error(
        `LLM data object must contain exactly one value, got ${values.length}`
      );
    }

    extractedData = values[0];
  } else {
    extractedData = data;
  }

  return {
    data: extractedData,
    newInstructionPlan: newInstructionPlan ?? null,
  };
}
