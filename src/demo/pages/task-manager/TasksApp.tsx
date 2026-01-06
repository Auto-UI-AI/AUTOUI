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
  const proxyUrl = import.meta.env.VITE_BASE_URL;
  const sharedSecret = import.meta.env.VITE_AUTOUI_SHARED_SECRET;

  const TasksAppConfig: AutoUIConfig = {
    /* =========================
     *   APP ID (IMPORTANT)
     * ========================= */
    appId: 'tasks-demo4',

    /* =========================
     *   METADATA
     * ========================= */
    metadata: {
      appName: 'AutoUI Task Manager',
      appVersion: '0.1.0',
      author: 'AutoUI Dev Team',
      createdAt: new Date().toISOString(),
      description:
        'Task management demo app with tasks list, filters, stats, and task editor modal. Always respond politely. If user intent is unclear, suggest UI actions. After opening UI outside the chat, suggest closing the chat widget.',
      tags: ['demo', 'tasks', 'productivity', 'react', 'autoui'],
    },

    /* =========================
     *   LLM (PROXY-FIRST)
     * ========================= */
    llm: {
      proxyUrl,
      sharedSecret,
      /**
       * High-level context for the assistant
       */
      appDescriptionPrompt:
        'A task management app with task list, filters, status changes, statistics, and a task editor form.',

      /**
       * Soft hints (proxy may override)
       */
      temperature: 0.2,
      maxTokens: 2048,
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
      errorHandling: {
        showToUser: true,
        retryOnFail: false,
      },
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
        callFunc: ({ draft }: { draft: TaskDraft }) => createTaskFromDraft(draft),
        returns: 'Task — full task with generated id and created_at fields.',
      },

      updateTask: {
        prompt: 'Update an existing Task using a TaskDraft patch, preserving id and created_at.',
        params: {
          task: 'Task — existing task',
          patch: 'TaskDraft — fields to update',
        },
        callFunc: ({ task, patch }: { task: Task; patch: TaskDraft }) => updateTaskWithDraft(task, patch),
        returns: 'Task — updated task object.',
      },

      summarizeTasks: {
        prompt: 'Compute task statistics: total count and counts by status and priority.',
        params: {
          tasks: 'Task[] — current list of tasks',
        },
        callFunc: ({ tasks }: { tasks: Task[] }) => {
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
          setShowForm(true);
        },
      },

      fetchCurrentTasksState: {
        prompt: 'Return the current list of tasks from application state.',
        callFunc: () => tasks,
        canShareDataWithLLM: true,
      },

      showHowManyTasks: {
        prompt: 'Return the number of tasks in the current task list.',
        callFunc: () => tasks.length,
      },
    },

    /* =========================
     *   COMPONENTS
     * ========================= */
    components: {
      TasksList: {
        prompt: 'Full tasks page with list, stats, filters and editor modal.',
        props: {
          tasks: 'Task[] — current task list from application state.',
        },
        defaults: {
          tasks,
        },
        callComponent: TasksList,
        category: 'layout',
        exampleUsage: '<TasksList tasks={tasks} />',
      },

      TaskItem: {
        prompt: 'Single task card with title, description, status, priority and actions.',
        props: {
          task: 'Task — task data',
        },
        defaults: {
          task: {
            id: 'example-id',
            title: 'Example Task',
            description: 'This is an example task.',
            status: 'todo',
            priority: 'medium',
            created_at: new Date().toISOString(),
          } as Task,
        },
        callComponent: TaskItem,
        category: 'tasks',
      },

      TaskStats: {
        prompt: 'Statistics bar showing counts of tasks by status and priority.',
        props: {
          tasks: 'Task[] — list of tasks',
        },
        callComponent: TaskStats,
        category: 'stats',
      },

      PointerHintButton: {
        prompt: 'button which triggers the custom cursor showing specified components',
        props: {
          target: `string, the actual data-guide-id of the component to be pointed out. The parameter MUST be a string that matches one of the known data-guide-id values
already present in the UI. For this demo, the allowed values are:

- "TaskFilters"
- "TaskFormButton"
- "StatusFilters"
- "PriorityFilters"
You MUST pass the single string parameter
`,
          textToBeInserted:
            'optional prop, string, the prop which means what would be rendered inside that button, the actual text of it',
          className: 'optional prop, string, some styles which could be written in tailwindcss',
        },
        callComponent: PointerHintButton,
        category: 'guide',
        exampleUsage: '<PointerHintButton target="TaskFilters">show me where are task filters</PointerHintButton>',
      },
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
