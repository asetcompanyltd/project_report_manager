"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { useProjectContext } from "@/context/ProjectContext";
import { ProjectCard } from "@/components/project/ProjectCard";
import { NewProjectDialog } from "@/components/project/NewProjectDialog";
import { EditProjectDialog } from "@/components/project/EditProjectDialog";
import { DeleteProjectDialog } from "@/components/project/DeleteProjectDialog";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  const { setCurrentProjectId } = useProjectContext();
  const router = useRouter();

  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  function openProject(id: string) {
    setCurrentProjectId(id);
    router.push(`/projects/${id}`);
  }

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>Projects</h1>
          <p>Create and switch between independent projects — each keeps its own data.</p>
        </div>
        <div className="actions">
          <Button variant="primary" onClick={() => setShowNew(true)}>
            + New Project
          </Button>
        </div>
      </header>

      {isLoading && <div className="center-loading">Loading projects…</div>}
      {error && <div className="form-error">Could not load projects.</div>}

      {!isLoading && projects && projects.length === 0 && (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>Create your first project to start tracking its status report.</p>
          <div style={{ marginTop: 16 }}>
            <Button variant="primary" onClick={() => setShowNew(true)}>
              + New Project
            </Button>
          </div>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="project-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onEdit={setEditing} onDelete={setDeleting} />
          ))}
        </div>
      )}

      <NewProjectDialog open={showNew} onClose={() => setShowNew(false)} onCreated={openProject} />
      <EditProjectDialog project={editing} onClose={() => setEditing(null)} />
      <DeleteProjectDialog project={deleting} onClose={() => setDeleting(null)} onDeleted={() => setDeleting(null)} />
    </div>
  );
}
