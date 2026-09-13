"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { useCreateProject } from "@/hooks/useProjects";
import { ApiClientError } from "@/services/apiClient";
import type { ProjectStatus } from "@/types/project";

const STATUS_OPTIONS: ProjectStatus[] = ["Active", "On Hold", "Completed", "Archived"];

export function NewProjectDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}) {
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Active");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setCode("");
    setDescription("");
    setStatus("Active");
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const project = await createProject.mutateAsync({ name, code, description, status });
      reset();
      onClose();
      onCreated(project.id);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not create project.");
    }
  }

  return (
    <Modal
      open={open}
      title="New Project"
      onClose={() => {
        reset();
        onClose();
      }}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" form="new-project-form" type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? "Creating…" : "Create Project"}
          </Button>
        </>
      }
    >
      {error && <div className="form-error">{error}</div>}
      <form id="new-project-form" onSubmit={handleSubmit}>
        <FormField label="Project Name">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </FormField>
        <FormField label="Project Code / ID">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. WTP-2026"
            required
          />
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
