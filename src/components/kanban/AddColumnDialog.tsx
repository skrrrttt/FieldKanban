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
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Predefined colors for columns
const COLUMN_COLORS = [
  { name: "Gray", value: "#6b7280" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
];

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onColumnCreated: () => void;
}

export function AddColumnDialog({
  open,
  onOpenChange,
  jobId,
  onColumnCreated,
}: AddColumnDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLUMN_COLORS[0].value);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a column name");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      // Get the highest order in this job to add at the end
      const { data: existingColumns } = await supabase
        .from("columns")
        .select("order")
        .eq("job_id", jobId)
        .order("order", { ascending: false })
        .limit(1);

      const newOrder = existingColumns?.[0]?.order ?? -1;

      const { error } = await supabase.from("columns").insert({
        job_id: jobId,
        name: name.trim(),
        color,
        order: newOrder + 1,
      });

      if (error) throw error;

      toast.success("Column created", {
        description: `"${name}" column has been added`,
      });

      // Reset form and close
      setName("");
      setColor(COLUMN_COLORS[0].value);
      onOpenChange(false);
      onColumnCreated();
    } catch (error) {
      console.error("Error creating column:", error);
      toast.error("Failed to create column");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (!saving) {
      setName("");
      setColor(COLUMN_COLORS[0].value);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Column</DialogTitle>
          <DialogDescription>
            Create a new column for your Kanban board
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Column Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., In Review, Testing, Blocked..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLUMN_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                  disabled={saving}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div
              className="w-4 h-full min-h-[20px] rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-medium">
              {name || "Column preview"}
            </span>
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
                "Create Column"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
