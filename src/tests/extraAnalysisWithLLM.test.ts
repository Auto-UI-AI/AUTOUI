import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extraAnalysisWithLLM } from '../lib/core/extraDataAnalyzingWithLLM';
import type { InstructionPlan, InstructionStep } from '../lib/types/llmTypes';

describe('extraAnalysisWithLLM', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  const plan: InstructionPlan = {
    type: 'sequence',
    steps: [],
  };

  const step: InstructionStep = {
    type: 'component',
    name: 'step1',
  };

  it('make request and parse password', async () => {
    const mockResponse = { json: async () => ({ data: 42 }) };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: mockResponse.json,
    });

    const config = { appId: 'app1', llm: { temperature: 0.5 }, functions: {} } as any;

    const result = await extraAnalysisWithLLM({ x: 1 }, config, 'Hello', 'prev messages', plan, step, 0, {
      parseTo: 'primitive',
      schema: {},
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(result).toEqual({
      data: {
        x: 1,
      },
      newInstructionPlan: null,
      parseTo: 'primitive',
    });
  });

  it('Throw error if fetch not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const config = { appId: 'app1', llm: { temperature: 0.5 }, functions: {} } as any;

    const result = await extraAnalysisWithLLM(1, config, '', '', plan, step, 0, null);

    expect(result).toEqual({
      parseTo: 'primitive',
      data: 1,
      newInstructionPlan: null,
    });
  });
});
