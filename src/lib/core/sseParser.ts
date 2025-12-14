export async function parseInstructionPlanFromSSE(stream: ReadableStream<Uint8Array>): Promise<any> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let finalText = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;

      const payload = line.replace('data:', '').trim();
      if (payload === '[DONE]') break;

      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta;

        if (delta?.content) {
          finalText += delta.content;
        }
      } catch {}
    }
  }

  try {
    return JSON.parse(finalText);
  } catch {
    throw new Error('Invalid InstructionPlan JSON from LLM');
  }
}
