// demo3/functions/createTask.ts
import { useTasksContext } from "../hooks/useTasksContext";

export async function createTask(title: string, details: string) {
  // This version assumes you’ll be using the function through React runtime,
  // where context is accessible. If you want to call from LLM runtime,
  // expose a callback version that Chat injects.
  const { addTask } = useTasksContext();
  addTask({ title, details });
  return { ok: true, title, details };
}
