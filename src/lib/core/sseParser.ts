export async function parseInstructionPlanFromSSE(stream: ReadableStream<Uint8Array>): Promise<any> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let text = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      if (!event.startsWith('data:')) continue;

      const payload = event.slice(5).trim();

      if (payload === '[DONE]') {
        reader.cancel();
        break;
      }

      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          text += delta;
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  const jsonMatch = text.match(/\{[\s\S]*\}$/);
  if (!jsonMatch) {
    throw new Error('LLM did not return valid JSON InstructionPlan');
  }

  return JSON.parse(jsonMatch[0]);
}
