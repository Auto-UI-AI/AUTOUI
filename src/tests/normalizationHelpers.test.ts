import {
  getConsumerKeysForAssign,
  getExpectedSchemaForStep,
  normalizeForCtx,
  stepConsumesAssign,
} from '@lib/utils/validation/normalizationHelpers';
import type { InstructionStep } from '../lib/types/llmTypes';
import { describe, it, expect } from 'vitest';

describe('stepConsumesAssign', () => {
  it('returns false for undefined step', () => {
    expect(stepConsumesAssign(undefined, 'x')).toBe(false);
  });

  it('detects assignKey in component props', () => {
    const step: InstructionStep = { type: 'component', name: 'C', props: { val: '{{x}}' } };
    expect(stepConsumesAssign(step, 'x')).toBe(true);
  });

  it('detects assignKey in function params', () => {
    const step: InstructionStep = { type: 'function', name: 'F', params: { p: '{{x}}' } };
    expect(stepConsumesAssign(step, 'x')).toBe(true);
  });

  it('returns false if assignKey not present', () => {
    const step: InstructionStep = { type: 'text', text: 'hello' };
    expect(stepConsumesAssign(step, 'x')).toBe(false);
  });
});

describe('getExpectedSchemaForStep', () => {
  const config = {
    components: { MyComp: { props: { a: 'string' } } },
    functions: { MyFn: { params: { b: 'number' } } },
  } as any;

  it('returns null for undefined step', () => {
    expect(getExpectedSchemaForStep(undefined, config)).toBeNull();
  });

  it('returns schema for component step', () => {
    const step: InstructionStep = { type: 'component', name: 'MyComp' };
    expect(getExpectedSchemaForStep(step, config)).toEqual({
      parseTo: 'object',
      schema: { a: 'string' },
    });
  });

  it('returns schema for function step', () => {
    const step: InstructionStep = { type: 'function', name: 'MyFn' };
    expect(getExpectedSchemaForStep(step, config)).toEqual({
      parseTo: 'object',
      schema: { b: 'number' },
    });
  });

  it('returns null for text step', () => {
    const step: InstructionStep = { type: 'text', text: 'hello' };
    expect(getExpectedSchemaForStep(step, config)).toBeNull();
  });
});

describe('getConsumerKeysForAssign', () => {
  it('returns empty array if step is undefined or not component', () => {
    expect(getConsumerKeysForAssign(undefined, 'x')).toEqual([]);
    expect(getConsumerKeysForAssign({ type: 'function', name: 'F' }, 'x')).toEqual([]);
  });

  it('returns keys of props containing assignKey', () => {
    const step: InstructionStep = {
      type: 'component',
      name: 'C',
      props: { a: '{{x}}', b: 'no', c: '{{x}}' },
    };
    expect(getConsumerKeysForAssign(step, 'x')).toEqual(['a', 'c']);
  });
});

describe('normalizeForCtx', () => {
  it('returns analyzed unchanged if consumerKeys length !== 1', () => {
    expect(normalizeForCtx({ a: 1 }, ['a', 'b'])).toEqual({ a: 1 });
  });

  it('returns the inner value if consumerKeys length === 1 and key exists', () => {
    expect(normalizeForCtx({ val: 123 }, ['val'])).toEqual(123);
  });

  it('returns analyzed unchanged if key does not exist', () => {
    expect(normalizeForCtx({ val: 123 }, ['x'])).toEqual({ val: 123 });
  });
});
