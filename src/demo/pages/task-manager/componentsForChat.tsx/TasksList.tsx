import { useTasksContext } from '../hooks/useAppFunctions';
import TaskItem from '../components/tasks/TaskItem';
import type { Task } from '../types/tasks';

const TasksList = ({ tasks }: { tasks: Task[] }) => {
  const { tasks: tasksFromContext } = useTasksContext();

  return (
    <div className="flex flex-col gap-4">
      {tasks.map((t) => {
        const stillExists = tasksFromContext.some((ctxTask) => ctxTask.id === t.id);

        if (!stillExists) {
          return (
            <div key={t.id} className="p-4 border shadow-sm border-rose-300 bg-rose-50 text-rose-700 rounded-xl">
              <p className="font-semibold">Task deleted</p>
              <p className="text-sm opacity-80">
                This task (<strong>{t.title}</strong>) no longer exists in the system.
              </p>
            </div>
          );
        }

        return <TaskItem key={t.id} task={t} />;
      })}
    </div>
  );
};

export default TasksList;
