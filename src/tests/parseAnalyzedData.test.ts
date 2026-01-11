import { describe, it, expect } from 'vitest';
import { parseAnalyzedData } from '../lib/core/parseAnalyzedData';

describe('parseAnalyzedData', () => {
  it('parses object', () => {
    expect(parseAnalyzedData({ parseTo: 'object', data: { a: 1 } })).toEqual({ a: 1 });
  });

  it('parses array', () => {
    expect(parseAnalyzedData({ parseTo: 'array', data: [1, 2] })).toEqual([1, 2]);
  });

  it('parses primitive', () => {
    expect(parseAnalyzedData({ parseTo: 'primitive', data: 5 })).toBe(5);
  });

  it('throws on invalid JSON string', () => {
    expect(() => parseAnalyzedData('invalid')).toThrow();
  });
});
