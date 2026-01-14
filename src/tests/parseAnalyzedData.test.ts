import { describe, it, expect } from 'vitest';
import { parseAnalyzedData } from '../lib/utils/formatting/parseAnalyzedData';

describe('parseAnalyzedData', () => {
  it('throws if content is not an object', () => {
    expect(() => parseAnalyzedData(null)).toThrow('Invalid LLM response: null or undefined');
    expect(() => parseAnalyzedData(42)).toThrow('Invalid LLM response: expected object but got number');
  });

  it('throws if data is missing', () => {
    expect(() => parseAnalyzedData({ parseTo: 'primitive' })).toThrow('Invalid LLM response: missing data');
  });

  it('returns primitive data with newInstructionPlan null', () => {
    const result = parseAnalyzedData({ parseTo: 'primitive', data: 42 });
    expect(result).toEqual({ data: 42, newInstructionPlan: null, parseTo: 'primitive' });
  });

  it('extracts object/array with a single key', () => {
    const result = parseAnalyzedData({
      parseTo: 'object',
      data: { value: { x: 123 } },
      newInstructionPlan: null,
    });
    expect(result).toEqual({ data: { x: 123 }, newInstructionPlan: null, parseTo: 'object' });
  });

  it('throws if object/array has more than one key', () => {
    expect(() => parseAnalyzedData({ parseTo: 'object', data: { a: 1, b: 2 } })).toThrow(
      "LLM data object must contain exactly one value when parseTo is 'object', got 2",
    );
  });
});
