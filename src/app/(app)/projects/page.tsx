"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, CheckCircle2, PauseCircle, Archive, Plus, LayoutGrid } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useProjectContext } from "@/context/ProjectContext";
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

  const stats = useMemo(() => {
    const list = projects ?? [];
    return {
      total: list.length,
      active: list.filter((p) => p.status === "Active").length,
      onHold: list.filter((p) => p.status === "On Hold").length,
      completed: list.filter((p) => p.status === "Completed").length,
      archived: list.filter((p) => p.status === "Archived").length,
    };
  }, [projects]);

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
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Create and switch between independent projects — each keeps its own data.</p>
        </div>
        <Button variant="primary" onClick={() => setShowNew(true)}>
          <Plus className="size-4" />
          New Project
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile icon={LayoutGrid} label="Total Projects" value={stats.total} color="bg-indigo-50 text-indigo-600" />
        <StatTile icon={FolderKanban} label="Active" value={stats.active} color="bg-emerald-50 text-emerald-600" />
        <StatTile icon={PauseCircle} label="On Hold" value={stats.onHold} color="bg-amber-50 text-amber-600" />
        <StatTile icon={CheckCircle2} label="Completed" value={stats.completed} color="bg-blue-50 text-blue-600" />
        <StatTile icon={Archive} label="Archived" value={stats.archived} color="bg-slate-100 text-slate-500" />
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load projects.</div>}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to start tracking its status report."
            action={
              <Button variant="primary" onClick={() => setShowNew(true)}>
                <Plus className="size-4" />
                New Project
              </Button>
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
            <div className="rounded-xl border border-slate-200 bg-white">
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

function StatTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`flex size-8 items-center justify-center rounded-lg ${color}`}>
        <Icon className="size-4" />
      </span>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}
