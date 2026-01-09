"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRepository } from "@/lib/data/repository-context";
import type { TaskPriority } from "@/types";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  columnId: string;
  columnName: string;
  userId: string;
  onTaskCreated: () => void;
}

export function AddTaskDialog({
  open,
  onOpenChange,
  jobId,
  columnId,
  columnName,
  userId,
  onTaskCreated,
}: AddTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [saving, setSaving] = useState(false);
  const repository = useRepository();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setSaving(true);

    try {
      // Get the highest order in this column to add at the end
      const tasksResult = await repository.getTasks(jobId);
      let newOrder = 0;
      if (tasksResult.success && tasksResult.data) {
        const columnTasks = tasksResult.data.filter((t) => t.columnId === columnId);
        newOrder = Math.max(-1, ...columnTasks.map((t) => t.order)) + 1;
      }

      const result = await repository.createTask({
        jobId,
        columnId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        order: newOrder,
        createdBy: userId,
        assignedTo: [],
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create task");
      }

      toast.success("Task created", {
        description: `"${title}" added to ${columnName}`,
      });

      // Reset form and close
      setTitle("");
      setDescription("");
      setPriority("medium");
      onOpenChange(false);
      onTaskCreated();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (!saving) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Create a new task in the &quot;{columnName}&quot; column
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as TaskPriority)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
