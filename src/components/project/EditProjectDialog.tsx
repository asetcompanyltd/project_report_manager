"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useUpdateProject } from "@/hooks/useProjects";
import { ApiClientError } from "@/services/apiClient";
import type { Project, ProjectStatus } from "@/types/project";

const STATUS_OPTIONS: ProjectStatus[] = ["Active", "On Hold", "Completed", "Archived"];

export function EditProjectDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const updateProject = useUpdateProject();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Active");
  const [error, setError] = useState<string | null>(null);

  // Reset the form fields whenever a different project is opened for editing.
  // Adjusting state during render (rather than in an effect) avoids an extra render/flicker.
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  if (project && project.id !== loadedProjectId) {
    setLoadedProjectId(project.id);
    setName(project.name);
    setCode(project.code);
    setDescription(project.description);
    setStatus(project.status);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!project) return;
    setError(null);
    try {
      await updateProject.mutateAsync({ projectId: project.id, input: { name, code, description, status } });
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not update project.");
    }
  }

  return (
    <Modal
      open={!!project}
      title="Edit Project"
      description="Update this project's details."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" form="edit-project-form" type="submit" loading={updateProject.isPending}>
            Save Changes
          </Button>
        </>
      }
    >
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
      <form id="edit-project-form" onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Project Name" required>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </FormField>
        <FormField label="Project Code / ID" required>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
        </FormField>
        <FormField label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </FormField>
        <FormField label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </FormField>
      </form>
    </Modal>
  );
}
