import React from "react";
import TaskItem from "./TaskItem";
import { useTasksContext } from "../hooks/useAppFunctions";
import { ScrollArea, Separator } from "../../demo/base";

const TaskList: React.FC = () => {
  const { tasks } = useTasksContext();
  if (!tasks.length) {
    return <p className="text-sm text-muted-foreground">No tasks yet. Create your first one!</p>;
  }

  return (
    <ScrollArea className="w-full h-full p-3 border rounded">
      <div className="flex flex-col gap-3">
        {tasks.map((task, i) => (
          <React.Fragment key={`${task.title}-${i}`}>
            <TaskItem title={task.title} details={task.details} />
            {i < tasks.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TaskList;
