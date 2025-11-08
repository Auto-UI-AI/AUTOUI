// src/demo3/components/TaskItem.tsx
export type TaskItemType = { title: string; details: string };

const TaskItem = ({ title, details }: TaskItemType) => (
  <div className="p-3 border rounded">
    <h3 className="font-semibold">{title}</h3>
    {details && <p className="mt-1 text-sm opacity-80">{details}</p>}
  </div>
);

export default TaskItem;
