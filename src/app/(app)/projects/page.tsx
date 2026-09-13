"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useProjectContext } from "@/context/ProjectContext";
import { usePermissions } from "@/hooks/usePermissions";
import { ProjectCard } from "@/components/project/ProjectCard";
import { NewProjectDialog } from "@/components/project/NewProjectDialog";
import { EditProjectDialog } from "@/components/project/EditProjectDialog";
import { DeleteProjectDialog } from "@/components/project/DeleteProjectDialog";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { CardSkeleton } from "@/components/ui/Skeleton";
import type { Project, ProjectStatus } from "@/types/project";

const PAGE_SIZE = 9;
const STATUS_FILTERS: (ProjectStatus | "All")[] = ["All", "Active", "On Hold", "Completed", "Archived"];

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  const { setCurrentProjectId } = useProjectContext();
  const router = useRouter();
  const { can } = usePermissions();
  const canCreate = can("projects", "create");

  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [page, setPage] = useState(1);

  function openProject(id: string) {
    setCurrentProjectId(id);
    router.push(`/projects/${id}`);
  }

  const filtered = useMemo(() => {
    const list = projects ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((p) => {
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesTerm = !term || p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [projects, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }
  function updateStatusFilter(value: ProjectStatus | "All") {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Projects</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and switch between independent projects — each keeps its own data.</p>
        </div>
        {canCreate && (
          <Button variant="primary" onClick={() => setShowNew(true)}>
            <Plus className="size-4" />
            New Project
          </Button>
        )}
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          Could not load projects.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to start tracking its status report."
            action={
              canCreate && (
                <Button variant="primary" onClick={() => setShowNew(true)}>
                  <Plus className="size-4" />
                  New Project
                </Button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={updateSearch} placeholder="Search by name or code…" className="sm:w-72" />
            <select
              value={statusFilter}
              onChange={(e) => updateStatusFilter(e.target.value as ProjectStatus | "All")}
              className="!w-auto sm:w-44"
              aria-label="Filter by status"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All statuses" : s}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <EmptyState title="No matching projects" description="Try a different search term or status filter." />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paged.map((p) => (
                <ProjectCard key={p.id} project={p} onEdit={setEditing} onDelete={setDeleting} />
              ))}
            </div>
          )}

          <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
        </>
      )}

      <NewProjectDialog open={showNew} onClose={() => setShowNew(false)} onCreated={openProject} />
      <EditProjectDialog project={editing} onClose={() => setEditing(null)} />
      <DeleteProjectDialog project={deleting} onClose={() => setDeleting(null)} onDeleted={() => setDeleting(null)} />
    </div>
  );
}
