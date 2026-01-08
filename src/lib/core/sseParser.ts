export async function parseInstructionPlanFromSSE(stream: ReadableStream<Uint8Array>): Promise<any> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let text = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    // Each line is a JSON object from the proxy
    const lines = chunk.split('\n').filter((line) => line.trim().startsWith('data: '));

    for (const line of lines) {
      try {
        const json = JSON.parse(line.replace(/^data: /, ''));
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) text += delta;
      } catch {
        // ignore incomplete lines
      }
    }
  }

  // Now text should contain the full JSON object as string
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse InstructionPlan JSON:', text);
    throw new Error('Invalid InstructionPlan JSON from LLM stream');
  }
}
