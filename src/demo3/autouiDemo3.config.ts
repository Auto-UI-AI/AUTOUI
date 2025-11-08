// demo3/autouiDemo3.config.ts
// import type { AutoUIConfig } from "../../lib/types";
import TaskList from "./components/TaskList";
import TaskItem from "./components/TaskItem";
// import { createTask } from "./functions/createTask";
import type { AutoUIConfig } from "@lib/types";
import CreateTaskForm from "./components/CreateTaskForm";

export const autouiDemo3Config: AutoUIConfig = {
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
      "A demo task manager where the assistant can create and list tasks interactively.",
  },

  runtime: {
    validateLLMOutput: true,
    storeChatToLocalStorage: true,
    localStorageKey: "autoui_demo3_chat",
    enableDebugLogs: true,
  },

  functions: {
    // createTask: {
    //   prompt:
    //     "Create a new task and add it to the user's list. Takes a title and details.",
    //   params: {
    //     title: "string — short task name",
    //     details: "string — task description or additional info",
    //   },
    //   callFunc: createTask,
    //   returns: "{ ok: boolean, title: string, details: string }",
    // },
  },

  components: {
    // TaskList: {
    //   prompt:
    //     "Displays the list of current tasks using data from context. Each task shows title and details.",
    //   props: {},
    //   callComponent: TaskList,
    //   category: "tasks",
    // },

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
          "function(title: string) — optional callback fired after a task is created (for example, to close a modal).",
      },
      callComponent: CreateTaskForm,
      category: "forms",
      exampleUsage: "<CreateTaskForm onCreated={(title) => console.log('Created', title)} />",
    },
  },
};

export default autouiDemo3Config;
