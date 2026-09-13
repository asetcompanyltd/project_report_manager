"use client";

import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useProjectContext } from "@/context/ProjectContext";

export function ProjectSelector() {
  const { data: projects, isLoading } = useProjects();
  const { currentProjectId, setCurrentProjectId } = useProjectContext();
  const router = useRouter();

  if (isLoading) return null;

  function handleChange(id: string) {
    setCurrentProjectId(id);
    router.push(`/projects/${id}`);
  }

  return (
    <div className="relative w-40 sm:w-64">
      <Folder className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <select
        value={currentProjectId ?? ""}
        onChange={(e) => e.target.value && handleChange(e.target.value)}
        aria-label="Select project"
        className="!py-2 !pl-9 !pr-3 !text-sm"
      >
        <option value="" disabled>
          {projects && projects.length ? "Select a project…" : "No projects yet"}
        </option>
        {projects?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.code})
          </option>
        ))}
      </select>
    </div>
  );
}
