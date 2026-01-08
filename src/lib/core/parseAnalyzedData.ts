export const parseAnalyzedData = (res: unknown) => {
  let parsed: any;

  if (typeof res === 'string') {
    try {
      parsed = JSON.parse(res);
    } catch {
      throw new Error('LLM returned invalid JSON');
    }
  } else if (typeof res === 'object' && res !== null) {
    parsed = res;
  } else {
    throw new Error('Analyzed data must be an object or JSON string');
  }

  if (!('parseTo' in parsed) || !('data' in parsed)) {
    throw new Error('Missing parseTo or data fields');
  }

  switch (parsed.parseTo) {
    case 'array':
      if (!Array.isArray(parsed.data)) throw new Error('Expected array data');
      return parsed.data;

    case 'object':
      if (typeof parsed.data !== 'object' || parsed.data === null) throw new Error('Expected object data');
      return parsed.data;

    case 'primitive':
      return parsed.data;

    default:
      throw new Error(`Unknown parseTo: ${parsed.parseTo}`);
  }
};
