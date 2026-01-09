"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { JobList } from "@/components/jobs";
import { useAppStore } from "@/lib/store/app-store";
import { useRepository } from "@/lib/data/repository-context";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import type { Job } from "@/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const currentUser = useAppStore((state) => state.currentUser);
  const isAdmin = currentUser?.role === "admin";
  const repository = useRepository();

  // Debounce search query to avoid filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    async function loadJobs() {
      setIsLoading(true);
      const result = await repository.getJobs();
      if (result.success && result.data) {
        setJobs(result.data);
      }
      setIsLoading(false);
    }
    loadJobs();
  }, [repository]);

  // Memoized filter to prevent recalculation on every render
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        debouncedSearchQuery === "" ||
        job.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        job.address?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, debouncedSearchQuery, statusFilter]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Jobs
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isAdmin
                ? "Manage all construction jobs"
                : "View your assigned jobs"}
            </p>
          </div>

          {isAdmin && (
            <Button asChild>
              <Link href="/admin/jobs/new">
                <Plus className="w-4 h-4 mr-2" />
                New Job
              </Link>
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        <JobList jobs={filteredJobs} isLoading={isLoading} />
      </div>
    </div>
  );
}
