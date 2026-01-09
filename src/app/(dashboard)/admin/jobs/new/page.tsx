"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

// Default columns for new jobs
const DEFAULT_COLUMNS = [
  { name: "To Do", order: 0, color: "#6b7280" },
  { name: "In Progress", order: 1, color: "#3b82f6" },
  { name: "Review", order: 2, color: "#f59e0b" },
  { name: "Done", order: 3, color: "#22c55e" },
];

export default function NewJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_name: "",
    address: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a job title");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a job");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      // Create the job
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          client_name: formData.client_name.trim() || null,
          address: formData.address.trim() || null,
          status: "active",
          created_by: user.id,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Create default columns for the job
      const columns = DEFAULT_COLUMNS.map((col) => ({
        job_id: job.id,
        name: col.name,
        order: col.order,
        color: col.color,
      }));

      const { error: columnsError } = await supabase
        .from("columns")
        .insert(columns);

      if (columnsError) {
        console.error("Error creating columns:", columnsError);
        // Job was created, but columns failed - show warning
        toast.warning("Job created but columns failed", {
          description: "You may need to add columns manually.",
        });
      }

      toast.success("Job created", {
        description: `${formData.title} has been created with default columns.`,
      });

      router.push(`/jobs/${job.id}`);
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Job</h1>
            <p className="text-muted-foreground">
              Add a new job with default Kanban columns
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Enter the basic information for this job. You can add tasks and
              assign users after creating the job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Job Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Parking Lot A Restriping"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  placeholder="e.g., ABC Properties"
                  value={formData.client_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, client_name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address / Location</Label>
                <Input
                  id="address"
                  placeholder="e.g., 123 Main St, City, State"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter any additional details about this job..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Default Columns</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  This job will be created with the following Kanban columns:
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLUMNS.map((col) => (
                    <div
                      key={col.name}
                      className="flex items-center gap-2 bg-background rounded px-3 py-1.5 border"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="text-sm">{col.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
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
                    "Create Job"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
