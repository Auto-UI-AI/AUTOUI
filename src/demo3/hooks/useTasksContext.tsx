// demo3/hooks/useTasksContext.tsx
import React, { createContext, useContext, useState } from "react";

export type Task = { title: string; details: string };

interface TasksContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: Task) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([
    { title: "Learn AutoUI", details: "Understand chat-driven component rendering" },
  ]);
  
  const addTask = (task: Task) => setTasks((prev) => [...prev, task]);

  return (
    <TasksContext.Provider value={{ tasks, setTasks, addTask }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasksContext must be used within TasksProvider");
  return ctx;
};
