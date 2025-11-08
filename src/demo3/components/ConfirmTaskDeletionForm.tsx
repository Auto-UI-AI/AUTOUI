import React, { useCallback, useMemo, useState } from "react";
import { useTasksContext, type Task } from "../hooks/useAppFunctions";
import { Alert, AlertDescription, AlertTitle } from "../../demo/base/alert";
import { Badge } from "../../demo/base/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../demo/base/alert-dialog";
import { Card, CardContent } from "../../demo/base";
import { Separator } from "../../demo/base";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "../../demo/base";

type Props = {
  task: Task;
  onCancel?: () => void;
};

function normalize(s: string) {
  return (s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreMatch(candidate: Task, query: Task): number {
  const ct = normalize(candidate.title);
  const cd = normalize(candidate.details);
  const qt = normalize(query.title);
  const qd = normalize(query.details);

  let score = 0;
  if (qt && ct === qt) score += 3;
  if (qd && cd === qd) score += 3;
  if (qt && qd && ct === qt && cd === qd) score += 2;
  if (qt && ct.includes(qt)) score += 1;
  if (qd && cd.includes(qd)) score += 1;
  return score;
}

const ConfirmTaskDeletionForm: React.FC<Props> = ({ task, onCancel }) => {
  const { tasks, setTasks } = useTasksContext();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedTitle, setDeletedTitle] = useState<string | null>(null);

  const matchedTask: Task | null = useMemo(() => {
    if (!tasks?.length) return null;
    let best: { task: Task; score: number } | null = null;
    for (const t of tasks) {
      const s = scoreMatch(t, task);
      if (s > 0 && (!best || s > best.score)) best = { task: t, score: s };
    }
    return best ? best.task : null;
  }, [tasks, task]);

  const handleDelete = useCallback(() => {
    if (!matchedTask) return;
    setIsDeleting(true);
    setTasks((prev) => prev.filter((t) => t !== matchedTask));
    setDeletedTitle(matchedTask.title);
  }, [matchedTask, setTasks]);

  if (deletedTitle) {
    return (
      <Alert className="border-green-200">
        <AlertTitle>Deleted</AlertTitle>
        <AlertDescription>
          The task <strong>{deletedTitle}</strong> has been removed.
        </AlertDescription>
      </Alert>
    );
  }

  const canDelete = !!matchedTask;
  const shownTitle = matchedTask?.title ?? "(no matching task)";

  return (
    <Card className="w-full max-w-xl">
      <CardContent className="pt-6">
        {!canDelete ? (
          <Alert variant="destructive">
            <AlertTitle>No matching task</AlertTitle>
            <AlertDescription>
              It looks like that task has already been deleted or cannot be matched by the provided text.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Match found</Badge>
              <span className="text-sm opacity-70">Ready to delete</span>
            </div>
            <Separator />
            <div className="text-sm">
              Are you sure you want to delete:{" "}
              <strong className="font-semibold">{shownTitle}</strong>?
            </div>

            <div className="flex gap-2 pt-2">
              <AlertDialog >
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={!canDelete || isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting…
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete the task: <strong>{shownTitle}</strong> from your list?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently remove the task{" "}
                      <strong>{shownTitle}</strong> from your list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDelete}
                    >
                      Confirm delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfirmTaskDeletionForm;
