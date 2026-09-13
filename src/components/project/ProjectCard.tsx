"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/types/project";

export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const canEdit = project.role === "owner" || project.role === "editor";
  const canDelete = project.role === "owner";

  return (
    <div className="card project-card">
      <span className="code">{project.code}</span>
      <h3>{project.name}</h3>
      <span className={`status-pill ${project.status.replace(/\s+/g, "-")}`}>{project.status}</span>
      <p>{project.description || "No description."}</p>
      <div className="project-card-actions">
        <Link href={`/projects/${project.id}`}>
          <Button variant="primary">Open</Button>
        </Link>
        {canEdit && (
          <Button variant="ghost" onClick={() => onEdit(project)}>
            Edit
          </Button>
        )}
        {canDelete && (
          <Button variant="danger" onClick={() => onDelete(project)}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
