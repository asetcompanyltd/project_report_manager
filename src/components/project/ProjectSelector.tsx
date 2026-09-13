"use client";

import { useRouter } from "next/navigation";
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
    <select
      value={currentProjectId ?? ""}
      onChange={(e) => e.target.value && handleChange(e.target.value)}
      aria-label="Select project"
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
  );
}
