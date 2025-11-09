// demo3/Demo3App.tsx
import React, { useCallback, useMemo } from "react";
import TaskList from "./components/TaskList";
import TaskItem from "./components/TaskItem";
import CreateTaskForm from "./components/CreateTaskForm";
import type { AutoUIConfig } from "@lib/types";
import { ModalChat } from "@lib";
import { useTasksContext, type Task } from "./hooks/useAppFunctions";
import ConfirmTaskDeletionForm from "./components/ConfirmTaskDeletionForm";
import TaskListForChat from "./components/TaskListForChat";

const Demo3App: React.FC = () => {
  const { tasks, setTasks, addTask } = useTasksContext();

  const updateTask = useCallback(
    (p?: {
    query?: Partial<{ title: string; details: string }>;
    patch?: Partial<{ title: string; details: string }>;
  }) => {
    const { query = {}, patch = {} } = p ?? {};
    const qt = (query.title ?? "").trim().toLowerCase();
    const qd = (query.details ?? "").trim().toLowerCase();

    let bestMatchIndex = -1;
    let bestScore = 0;

    const score = (task: Task) => {
      const tt = task.title.toLowerCase();
      const td = task.details.toLowerCase();
      let s = 0;
      if (qt && tt.includes(qt)) s += 2;
      if (qd && td.includes(qd)) s += 2;
      if (qt && tt === qt) s += 3;
      if (qd && td === qd) s += 3;
      return s;
    };

    tasks.forEach((t, i) => {
      const sc = score(t);
      if (sc > bestScore) {
        bestScore = sc;
        bestMatchIndex = i;
      }
    });

    if (bestMatchIndex === -1) {
      return {
        ok: false,
        reason: "No matching task found by provided text.",
      };
    }

    setTasks((prev) =>
      prev.map((t, i) => (i === bestMatchIndex ? { ...t, ...patch } : t))
    );

    return {
      ok: true,
      matchedIndex: bestMatchIndex,
      updatedFields: patch,
      message: `Updated task #${bestMatchIndex + 1} (${tasks[bestMatchIndex].title}).`,
    };
  }, [])

  const removeTask = useCallback((index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
    return { ok: true, index };
  }, [setTasks]);
  
  const autouiDemo3Config = useMemo<AutoUIConfig>(() => ({
    metadata: {
      appName: "AutoUI Task Manager",
      appVersion: "0.1.0",
      author: "AutoUI Dev Team",
      description: "A simple interactive task manager using React context.",
      tags: ["demo", "tasks", "react", "autoui"],
    },

    llm: {
      provider: "openrouter",
      baseUrl: import.meta.env.VITE_BASE_URL,
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
      model: import.meta.env.VITE_AIMODEL_NAME,
      temperature: 0.2,
      appDescriptionPrompt:
        "A demo task manager where the assistant can create and list tasks interactively. Even if you have some problems with step creation always respond with the last step as a text, so that it would be visible for user that nothing is wrong. If user is not giving you really clear instructions, you better suggest him some kind of a workflow. Like suggest what to do and show the component",
    },

    runtime: {
      validateLLMOutput: true,
      storeChatToLocalStorage: true,
      localStorageKey: "autoui_demo3_chat",
      enableDebugLogs: true,
    },

    functions: {
  fetchTasks: {
    prompt:
      "Fetch the current list of tasks from context and return it as an array.",
    params: {},
    callFunc: () => tasks,
    returns: "Task[] — an array of current tasks, each with title and details.",
  },

  createTask: {
    prompt:
      "Create a new task and append it to the list. Provide title and details.",
    params: {
      title: "string — the short title or name of the task",
      details: "string — additional details or description of the task",
    },
    callFunc: (p?: { title?: string; details?: string }) => {
      const t = String(p?.title ?? "").trim();
      const d = String(p?.details ?? "");
      addTask({ title: t, details: d });
      return { ok: true, title: t, details: d };
    },
    returns:
      "{ ok: boolean, title: string, details: string } — confirmation of creation.",
  },

  updateTask: {
     prompt:
    "Update a task by matching its title or details text using a partial patch (e.g., { title?: string, details?: string }). " +
    "If multiple tasks match, the most similar one is updated. Returns an object describing which task was modified.",
  params: {
    query:
      "object — text-based query for identifying the task, e.g. { title?: string, details?: string }",
    patch:
      "object — fields to update, e.g., { title?: string, details?: string }",
  },
    callFunc: updateTask,
     returns:
    "{ ok: boolean, matchedIndex?: number, updatedFields?: object, message?: string }",
  },

  removeTask: {
    prompt:
      "Remove a task by its index.",
    params: {
      index: "number — the position of the task in the list to remove",
    },
    callFunc: (p?: { index?: number }) => {
      const index = Number(p?.index ?? -1);
      return removeTask(index);
    },
    returns: "{ ok: boolean, index: number }",
  },
},

    components: {
      TaskListForChat: {
        props: {
          tasks: "task[] - where task is {title: string, description: string}"
        },
        prompt:
          "Displays the current snapshot of a list of tasks with title and details.",
        callComponent: TaskListForChat,
        category: "tasks",
      },
      TaskItem: {
        prompt:
          "Displays a single task with its title and details. Used inside the task list.",
        props: {
          title: "string — short name of the task",
          details: "string — detailed description of the task",
        },
        callComponent: TaskItem,
        category: "tasks",
      },
      CreateTaskForm: {
        prompt:
          "A form that lets the user create a new task. It updates the task list via context automatically.",
        props: {
          onCreated:
            "function(title: string) — optional callback fired after a task is created (e.g., close modal).",
        },
        callComponent: CreateTaskForm,
        category: "forms",
        exampleUsage:
          "<CreateTaskForm onCreated={(title) => console.log('Created', title)} />",
      },
      ConfirmTaskDeletionForm:{
        prompt:
          "A form that lets the user confirm the deletion of the task with specified text. It updates the task list via context automatically, so that the task with specific text is being deleted. It has a built in deleting function which filters out the passed task ou of the context tasks state list",
        props: {
          task:
            "task:{title: string, description:string} — the Task type prop which is required for finding in the state list by text",
        },
        callComponent: ConfirmTaskDeletionForm,
        category: "forms",
        exampleUsage:
          "<ConfirmTaskDeletionForm task={{title:'visit Paris', description: 'due to 10 of february'} />",
      }
    },
  }), [tasks, addTask, updateTask, removeTask]);

  return (
    <div>
      <TaskList />
      <ModalChat config={autouiDemo3Config} />
    </div>
  );
};

export default Demo3App;
