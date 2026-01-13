import { describe, it, expect } from 'vitest';
import { parseInstructionPlanFromSSE } from '../lib/core/sseParser';

describe('parseInstructionPlanFromSSE', () => {
  it('parses SSE stream', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('data: {"choices":[{"delta":{"content":"{ \\"type\\": \\"sequence\\","}}]}\n\n'),
        );
        controller.enqueue(
          new TextEncoder().encode('data: {"choices":[{"delta":{"content":"\\"steps\\":[] }"}}]}\n\n'),
        );
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    const plan = await parseInstructionPlanFromSSE(stream);
    expect(plan.type).toBe('sequence');
  });
});
