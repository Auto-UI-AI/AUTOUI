// src/demo3/components/TaskList.tsx
import React from "react";
import TaskItem, { type TaskItemType } from "./TaskItem";
import { useTasksContext } from "../hooks/useTasksContext";
export type TaskListForChatProps = {
    tasks: TaskItemType[]
}
const TaskListForChat = ({tasks}: TaskListForChatProps) => {
//   const { tasks } = useTasksContext();
  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task, i) => (
        <TaskItem key={i} title={task.title} details={task.details} />
      ))}
    </div>
  );
};

export default TaskListForChat;
