export function parseAnalyzedData(content: any) {
  if (!content || typeof content !== 'object') {
    throw new Error('Invalid LLM response: not an object');
  }

  const { parseTo, data } = content;

  if (data === undefined) {
    throw new Error('Invalid LLM response: missing data');
  }

  // If data is an object, extract its single value
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

    return values[0];
  }

  // primitive → data itself is the value
  return data;
}
