import { ModalChat } from '@lib';
import Tasks from './MainPage';
import type { AutoUIConfig } from '@lib/types';
import type { Task, TaskDraft } from './types/tasks';
import TaskForm from './components/tasks/TaskForm';
import TaskItem from './components/tasks/TaskItem';
import TaskFilters from './components/tasks/TaskFilters';
import TaskStats from './components/tasks/TaskStats';
import TasksList from './componentsForChat.tsx/TasksList';
import { useTasksContext } from './hooks/useAppFunctions';
import { usePointerContext } from './hooks/PointerContext';
import { useCallback } from 'react';
import { SmartCursor } from './components/cursor/smartCursor';
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const aiModel = import.meta.env.VITE_AIMODEL_NAME;
const baseUrl = import.meta.env.VITE_BASE_URL;
const TasksApp = () => {
  const { tasks, showForm, setShowForm } = useTasksContext();
  const { pointTo } = usePointerContext();

  const createTaskFromDraft = useCallback((draft: TaskDraft): Task => {
    return {
      ...draft,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
  }, []);

  const updateTaskWithDraft = useCallback((task: Task, patch: TaskDraft): Task => {
    return {
      ...task,
      ...patch,
    };
  }, []);

  const TasksAppConfig: AutoUIConfig = {
    /* =========================
     *   METADATA
     * ========================= */
    metadata: {
      appName: 'AutoUI Task Manager',
      appVersion: '0.1.0',
      author: 'AutoUI Dev Team',
      createdAt: new Date().toISOString(),
      description:
        "Task management demo app with tasks list, filters, stats, and task editor modal. Always try to answer really politely and if you didn't understand the intent of the user's message, then try to give him an interface which could help him as much as possible. In the messages after functions which open some components outside the chat widget, you better say to user that he should probably close the chatwidget",
      tags: ['demo', 'tasks', 'productivity', 'react', 'autoui'],
    },

    /* =========================
     *   LLM
     * ========================= */
    llm: {
      provider: 'openrouter',
      baseUrl,
      apiKey,
      model: aiModel,
      temperature: 0.2,
      appDescriptionPrompt:
        'A task management app with task list, filters, status changes, stats and task editor form.',
      maxTokens: 2048,
      requestHeaders: {
        'HTTP-Referer': 'https://autoui.dev',
        'X-Title': 'AutoUI Tasks Demo',
      },
    },

    /* =========================
     *   RUNTIME
     * ========================= */
    runtime: {
      validateLLMOutput: true,
      storeChatToLocalStorage: true,
      localStorageKey: 'autoui_tasks_demo_chat',
      enableDebugLogs: true,
      maxSteps: 20,
      errorHandling: { showToUser: true, retryOnFail: false },
    },

    /* =========================
     *   FUNCTIONS
     * ========================= */
    functions: {
      createTask: {
        prompt: 'Create a new Task object from a TaskDraft by adding id and created_at timestamp.',
        params: {
          draft: 'TaskDraft — { title, description?, status, priority, due_date? }',
        },
        callFunc: (args: { draft: TaskDraft }) => {
          return createTaskFromDraft(args.draft);
        },
        returns: 'Task — full task with generated id and created_at fields ready to be added to the list.',
      },

      updateTask: {
        prompt: 'Update an existing Task object using a TaskDraft patch, keeping id and created_at.',
        params: {
          task: 'Task — current version of the task',
          patch: 'TaskDraft — new values for fields like title, description, status, priority, due_date',
        },
        callFunc: (args: { task: Task; patch: TaskDraft }) => {
          return updateTaskWithDraft(args.task, args.patch);
        },
        returns: 'Task — new merged task object after applying the provided patch.',
      },

      summarizeTasks: {
        prompt: 'Given a list of tasks, compute basic statistics: total count and counts by status and priority.',
        params: {
          tasks: 'Task[] — array of existing tasks',
        },
        callFunc: (args: { tasks: Task[] }) => {
          const { tasks } = args;
          const total = tasks.length;

          const byStatus: Record<string, number> = {};
          const byPriority: Record<string, number> = {};

          for (const t of tasks) {
            byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
            byPriority[t.priority] = (byPriority[t.priority] ?? 0) + 1;
          }

          return { total, byStatus, byPriority };
        },
        returns: '{ total: number, byStatus: Record<string, number>, byPriority: Record<string, number> }',
      },
      openTaskForm: {
        prompt:
          'function opening the TaskForm on the main apps page so that the user would just input the data by himself. After opening it, say in the next message that user can close the chat and input data in that newly opened form',
        callFunc: () => {
          setTimeout(() => setShowForm(true), 2000);
        },
      },
      fetchCurrentTasksState: {
        prompt: 'function which fetches the current state of the tasks state and returns it',
        callFunc: () => {
          return tasks;
        },
      },
      showHowManyTasks: {
        prompt: 'function which returns the length of current state of tasks list',
        callFunc: () => {
          return tasks.length;
        },
      },
      pointToElementByDataGuideAttr: {
        /**
         * Prompt used by the LLM to decide when/how to call this function
         */
        prompt: `
Use this function when you want to visually guide the user to a specific UI element
on the page by moving a custom pointer/cursor to that element.

This function highlights ONE existing element by its data-guide-id attribute.

The parameter MUST be a string that matches one of the known data-guide-id values
already present in the UI. For this demo, the allowed values are:

- "TaskFilters"

You MUST pass the parameter inside an object with a single field "dataGuideAttr".
Example of a correct call inside a plan:

{
  "type": "function",
  "name": "pointToElementByDataGuideAttr",
  "params": { "dataGuideAttr": "TaskFilters" }
}

Use this function only when the user needs help finding that UI part
(e.g. "Where can I change the filters?", "Show me where the filters are").
If none of the allowed ids is relevant, do NOT call this function.
  `.trim(),

        /**
         * Descriptive list of parameters (for documentation & LLM guidance)
         */
        params: {
          dataGuideAttr:
            `Required. String. The data-guide-id of the element to point at. ` +
            `For this demo it MUST be exactly one of: "TaskFilters".`,
        },

        /**
         * Description of the expected return type
         */
        returns: 'void. Triggers an animation of the custom cursor towards the target element; no value is returned.',

        /**
         * The actual callable implementation (may be mocked)
         *
         * We normalize the params object and pass only the string to pointTo,
         * so we never get [object Object] again.
         */
        callFunc: (params: { dataGuideAttr: string }) => {
          // defensive: handle bad shapes just in case
          const id =
            typeof params === 'string'
              ? params
              : typeof params?.dataGuideAttr === 'string'
                ? params.dataGuideAttr
                : undefined;

          if (!id) {
            console.warn('pointToElementByDataGuideAttr called without a valid dataGuideAttr string');
            return;
          }

          // your existing pointer function, which expects a string
          pointTo(id);
        },

        /**
         * Optional example usage or notes for LLM context
         */
        exampleUsage: `
User: "I can't find where to change the filters."

Plan step:

{
  "type": "function",
  "name": "pointToElementByDataGuideAttr",
  "params": { "dataGuideAttr": "TaskFilters" }
}
  `.trim(),

        /**
         * Optional tags for organization
         */
        tags: ['ui-guide', 'pointer', 'navigation', 'demo'],
      },
    },

    /* =========================
     *   COMPONENTS
     * ========================= */
    components: {
      // ---- Main tasks page
      TasksList: {
        prompt:
          'Full tasks page: header, stats, filters, tasks list and task editor modal. Use it when you want a complete task management experience.',
        props: {
          tasks: 'Task[] - current fetched state of tasks from global Tasks context of the app, or just the state',
        },
        defaults: {
          tasks: tasks,
        },
        callComponent: TasksList,
        category: 'layout',
        exampleUsage: '<TasksList tasks={tasks}/>',
      },

      // // ---- Task form modal
      // TaskForm: {
      //   prompt:
      //     "Task editor form used to create or update a task. It accepts an optional existing task.",
      //   props: {
      //     task: "Task (optional) — if provided, the form edits this task; if omitted, it creates a new one.",
      //     onSubmit:
      //       "function(draft: TaskDraft) — called when the user submits the form.",
      //     onCancel:
      //       "function() — called when the user cancels/close the form.",
      //   },
      //   defaults: {
      //     task: undefined,
      //   },
      //   callComponent: TaskForm,
      //   category: "editor",
      //   exampleUsage:
      //     "<TaskForm task={existingTask} onSubmit={handleSubmit} onCancel={handleCancel} />",
      // },

      // ---- Single task item
      TaskItem: {
        prompt:
          'Single task card displaying title, description, status, priority and actions (edit, delete, change status). ',
        props: {
          task: 'Task — task data to show.',
          onEdit: 'function(task: Task) — open editor for this task.',
          onDelete: 'function(task: Task) — delete this task from the list or ask for confirmation.',
          onStatusChange: 'function(task: Task, nextStatus: Status) — change status of this task.',
        },
        defaults: {
          task: {
            id: 'example-id',
            title: 'Example Task',
            description: 'This is an example task item.',
            status: 'todo',
            priority: 'medium',
            created_at: new Date().toISOString(),
          } as Task,
        },
        callComponent: TaskItem,
        category: 'tasks',
        exampleUsage: '<TaskItem task={t} onEdit={editTask} onDelete={deleteTask} onStatusChange={changeStatus} />',
      },

      // ---- Filters
      //   TaskFilters: {
      //     prompt: 'Filter controls for tasks by status and priority. Use to narrow down the visible tasks.',
      //     props: {
      //       filters:
      //         "{ status: 'all' | 'todo' | 'in_progress' | 'done'; priority: 'all' | 'low' | 'medium' | 'high' } — current filters state.",
      //       onFilterChange: 'function(next: TaskFiltersState) — update the filters based on user selection.',
      //     },
      //     defaults: {
      //       filters: { status: 'all', priority: 'all' },
      //     },
      //     callComponent: TaskFilters,
      //     category: 'filters',
      //     exampleUsage: '<TaskFilters filters={filters} onFilterChange={setFilters} />',
      //   },

      // ---- Stats
      TaskStats: {
        prompt: 'Statistics bar showing counts of tasks by status and possibly other metrics.',
        props: {
          tasks: 'Task[] — list of tasks to compute and display statistics for.',
        },
        defaults: {
          tasks: [
            {
              id: '1',
              title: 'Finish UI prototype',
              description: 'Complete the task management UI.',
              status: 'in_progress',
              priority: 'high',
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              title: 'Write documentation',
              description: 'Describe how to use the task manager.',
              status: 'todo',
              priority: 'medium',
              created_at: new Date().toISOString(),
            },
          ] as Task[],
        },
        callComponent: TaskStats,
        category: 'stats',
        exampleUsage: '<TaskStats tasks={tasks} />',
      },
    },
  };
  return (
    <main>
      <Tasks />
      <ModalChat config={TasksAppConfig} />
      <SmartCursor/>
    </main>
  );
};

export default TasksApp;
