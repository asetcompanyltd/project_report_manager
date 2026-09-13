import { api } from "./apiClient";
import type { Project, ProjectStatus } from "@/types/project";

export interface CreateProjectInput {
  name: string;
  code: string;
  description?: string;
  status?: ProjectStatus;
}
export type UpdateProjectInput = Partial<CreateProjectInput>;

export const projectsService = {
  list: () => api.get<Project[]>("/api/projects"),
  get: (projectId: string) => api.get<Project>(`/api/projects/${projectId}`),
  create: (input: CreateProjectInput) => api.post<Project>("/api/projects", input),
  update: (projectId: string, input: UpdateProjectInput) => api.patch<Project>(`/api/projects/${projectId}`, input),
  remove: (projectId: string) => api.delete<{ success: boolean }>(`/api/projects/${projectId}`),
};
