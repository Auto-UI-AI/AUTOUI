import { ModalChat, autouiRegisterComponentPropsSchema, autouiRegisterFunctionParamsSchema } from '@autoai-ui/autoui';
import Tasks from './MainPage';
import type { AutoUIConfig } from '@autoai-ui/autoui';
import TaskStats from './components/tasks/TaskStats';
import TasksList from './componentsForChat.tsx/TasksList';
import { useTasksContext } from './hooks/useAppFunctions';
import { PointerHintButton } from './componentsForChat.tsx/PointerHintButton';
import NumberDisplay from './componentsForChat.tsx/NumberDisplay';
import { useTaskFunctions } from './hooks/useTaskFunctions';

autouiRegisterComponentPropsSchema(TaskStats);
autouiRegisterComponentPropsSchema(TasksList);
autouiRegisterComponentPropsSchema(PointerHintButton);
autouiRegisterComponentPropsSchema(NumberDisplay);

const TasksApp = () => {
  const { tasks } = useTasksContext();
  
  const {
    createTask,
    updateTask,
    deleteTask,
    fetchCurrentTasksState,
    openTaskForm,
    showHowManyTasks,
    createTaskFromDraft,
    updateTaskWithDraft,
    clearCompletedTasks,
  } = useTaskFunctions();

  autouiRegisterFunctionParamsSchema(createTask);
  autouiRegisterFunctionParamsSchema(updateTask);
  autouiRegisterFunctionParamsSchema(deleteTask);
  autouiRegisterFunctionParamsSchema(fetchCurrentTasksState);
  autouiRegisterFunctionParamsSchema(openTaskForm);
  autouiRegisterFunctionParamsSchema(showHowManyTasks);
  autouiRegisterFunctionParamsSchema(createTaskFromDraft);
  autouiRegisterFunctionParamsSchema(updateTaskWithDraft);
  autouiRegisterFunctionParamsSchema(clearCompletedTasks);
  const proxyUrl = import.meta.env.VITE_BASE_URL;
  const sharedSecret = import.meta.env.VITE_AUTOUI_SHARED_SECRET;

  const TasksAppConfig: AutoUIConfig = {
    /* =========================
     *   APP ID (IMPORTANT)
     * ========================= */
    // appId: 'app_1768157856796_sppwztm',

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
        callFunc: createTask,
      },

      updateTask: {
        prompt: 'Update an existing Task using a TaskDraft patch, preserving id and created_at.',
        callFunc: updateTask,
      },

      openTaskForm: {
        prompt:
          'function opening the TaskForm on the main apps page so that the user would just input the data by himself. After opening it, say in the next message that user can close the chat and input data in that newly opened form',
        callFunc: openTaskForm,
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

      deleteTask: {
        prompt: 'Delete a task by its ID from the task list.',
        callFunc: deleteTask,
      },

      clearCompletedTasks: {
        prompt: 'Clear all completed (done) tasks from the task list. Returns the count of cleared tasks.',
        callFunc: clearCompletedTasks,
      },
    },

    /* =========================
     *   COMPONENTS
     * ========================= */
    components: {
      TasksList: {
        prompt: 'Full tasks page with list, stats, filters and editor modal.',
        defaults: {
          tasks,
        },
        callComponent: TasksList,
        category: 'layout',
        exampleUsage: '<TasksList tasks={tasks} />',
      },

      TaskStats: {
        prompt: 'Statistics bar showing counts of tasks by status and priority.',
        callComponent: TaskStats,
        category: 'stats',
      },

      PointerHintButton: {
        prompt: 'button which triggers the custom cursor showing specified components. In our app we have such anchors, TaskFilters, search-bar, TaskFormButton',
        callComponent: PointerHintButton,
        category: 'guide',
        exampleUsage: '<PointerHintButton target="TaskFilters">show me where are task filters</PointerHintButton>',
      },

      NumberDisplay: {
        prompt: 'Displays a number value in a styled card component. Use this to show numeric values to the user.',
        callComponent: NumberDisplay,
        category: 'display',
        exampleUsage: '<NumberDisplay value={42} />',
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
