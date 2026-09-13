"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useDeleteProject } from "@/hooks/useProjects";
import { ApiClientError } from "@/services/apiClient";
import type { Project } from "@/types/project";

export function DeleteProjectDialog({
  project,
  onClose,
  onDeleted,
}: {
  project: Project | null;
  onClose: () => void;
  onDeleted: (projectId: string) => void;
}) {
  const deleteProject = useDeleteProject();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset the confirmation field whenever a different project is opened for deletion.
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  const openProjectId = project?.id ?? null;
  if (openProjectId !== loadedProjectId) {
    setLoadedProjectId(openProjectId);
    setConfirmText("");
    setError(null);
  }

  const canDelete = !!project && confirmText.trim() === project.name;

  async function handleDelete() {
    if (!project || !canDelete) return;
    setError(null);
    try {
      await deleteProject.mutateAsync(project.id);
      onClose();
      onDeleted(project.id);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not delete project.");
    }
  }

  return (
    <Modal
      open={!!project}
      title="Delete Project"
      description="This action is permanent and cannot be undone."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="danger-solid" onClick={handleDelete} disabled={!canDelete} loading={deleteProject.isPending}>
            Delete Project
          </Button>
        </>
      }
    >
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
      <div className="mb-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5">
        <AlertTriangle className="size-5 shrink-0 text-red-500" />
        <p className="text-sm text-red-700">
          This permanently deletes <b>{project?.name}</b> and all of its phases, site details, next steps, notes, and
          saved versions. This cannot be undone.
        </p>
      </div>
      <FormField label={`Type "${project?.name ?? ""}" to confirm`}>
        <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoFocus />
      </FormField>
    </Modal>
  );
}
