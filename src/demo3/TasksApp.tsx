import { ModalChat } from '@lib';
import Tasks from './MainPage';
import type { AutoUIConfig } from '@lib/types';
import type { Task, TaskDraft } from './types/tasks';
import TaskItem from './components/tasks/TaskItem';
import TaskStats from './components/tasks/TaskStats';
import TasksList from './componentsForChat.tsx/TasksList';
import { useTasksContext } from './hooks/useAppFunctions';
import { useCallback } from 'react';
import { PointerHintButton } from './componentsForChat.tsx/PointerHintButton';
const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
const aiModel = import.meta.env.VITE_AIMODEL_NAME;
const baseUrl = import.meta.env.VITE_BASE_URL;
const TasksApp = () => {
  const { tasks, setShowForm } = useTasksContext();

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
        callFunc: () => {setShowForm(true)},
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
      PointerHintButton: {
        prompt: "button which triggers the custom cursor showing specified components",
        props:{
            target: `string, the actual data-guide-id of the component to be pointed out. The parameter MUST be a string that matches one of the known data-guide-id values
already present in the UI. For this demo, the allowed values are:

- "TaskFilters"
- "TaskFormButton"
- "StatusFilters"
- "PriorityFilters"
You MUST pass the single string parameter
`,
              textToBeInserted: "optional prop, string, the prop which means what would be rendered inside that button, the actual text of it",
              className: "optional prop, string, some styles which could be written in tailwindcss"
        },
        callComponent: PointerHintButton,
        category: "guide",
        exampleUsage: '<PointerHintButton target="TaskFilters">show me where are task filters</PointerHintButton>',
      }
    },
  };
  return (
    <main>
      <Tasks />
      <ModalChat config={TasksAppConfig} />
    </main>
  );
};

export default TasksApp;
