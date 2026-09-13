import { api } from "./apiClient";
import type { PermissionModule } from "@/types/permissions";

export interface Role {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Inactive";
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionRow {
  id: string;
  roleId: string;
  module: PermissionModule;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}

export interface ModulePermissionInput {
  module: PermissionModule;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export const rolesService = {
  list: () => api.get<Role[]>("/api/roles"),
  get: (id: string) => api.get<Role>(`/api/roles/${id}`),
  create: (input: CreateRoleInput) => api.post<Role>("/api/roles", input),
  update: (id: string, input: Partial<CreateRoleInput>) => api.patch<Role>(`/api/roles/${id}`, input),
  remove: (id: string, reassignToRoleId?: string) =>
    api.delete<{ success: boolean; reassigned: number }>(
      `/api/roles/${id}${reassignToRoleId ? `?reassignToRoleId=${encodeURIComponent(reassignToRoleId)}` : ""}`
    ),
  getPermissions: (id: string) => api.get<RolePermissionRow[]>(`/api/roles/${id}/permissions`),
  updatePermissions: (id: string, permissions: ModulePermissionInput[]) =>
    api.patch<RolePermissionRow[]>(`/api/roles/${id}/permissions`, { permissions }),
};
