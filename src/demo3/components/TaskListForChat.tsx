import React from "react";
import TaskItem from "./TaskItem";
import { type Task } from "../hooks/useAppFunctions";
import { Separator } from "../../demo/base";

export type TaskListForChatProps = {
  tasks: Task[];
};

const TaskListForChat: React.FC<TaskListForChatProps> = ({ tasks }) => {
  if (!tasks.length) {
    return <p className="text-sm text-muted-foreground">No tasks to display.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task, i) => (
        <React.Fragment key={`${task.title}-${i}`}>
          <TaskItem title={task.title} details={task.details} />
          {i < tasks.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TaskListForChat;
