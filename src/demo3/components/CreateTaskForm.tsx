// src/demo3/components/CreateTaskForm.tsx
import React, { useState } from "react";
import { useTasksContext } from "../hooks/useTasksContext";

type CreateTaskFormProps = {
  onCreated?: (title: string) => void; // optional callback (e.g., close modal)
};

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onCreated }) => {
  const { addTask } = useTasksContext();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const t = title.trim();
    const d = details.trim();

    if (!t) {
      setError("Title is required.");
      return;
    }

    try {
      setSubmitting(true);
      // create the task right here via context
      addTask({ title: t, details: d });
      setTitle("");
      setDetails("");
      onCreated?.(t);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label className="flex flex-col">
        <span className="text-sm font-medium">Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Write README"
          className="px-2 py-1 border rounded"
        />
      </label>

      <label className="flex flex-col">
        <span className="text-sm font-medium">Details</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Optional details…"
          className="px-2 py-1 border rounded"
          rows={3}
        />
      </label>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="px-3 py-2 text-white bg-black rounded disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Create Task"}
      </button>
    </form>
  );
};

export default CreateTaskForm;
