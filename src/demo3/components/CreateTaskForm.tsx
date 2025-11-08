import React, { useState } from "react";
import { useTasksContext } from "../hooks/useAppFunctions";
import { Loader2, Plus } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input } from "../../demo/base";
import { Textarea } from "../../demo/base/textarea";
import { Alert, AlertDescription } from "../../demo/base/alert";
import { Label } from "../../demo/base/label";

type CreateTaskFormProps = {
  onCreated?: (title: string) => void;
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
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Create a Task</CardTitle>
        <CardDescription>Add a clear title and optional details.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Write README"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-details">Details</Label>
            <Textarea
              id="task-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Optional details…"
              rows={4}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateTaskForm;
