import { api } from "./apiClient";
import type { UserStatus } from "@/types/project";
import type { PermissionMatrix, PermissionModule } from "@/types/permissions";

export interface ManagedUser {
  id: string;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
  roleId: string | null;
  roleName: string | null;
  status: UserStatus;
  profileImage: string | null;
  themePreference: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  username?: string;
  email: string;
  phone?: string;
  password: string;
  roleId: string;
  status?: UserStatus;
}

export interface UpdateUserInput {
  name?: string;
  username?: string | null;
  phone?: string | null;
  roleId?: string;
  status?: UserStatus;
  profileImage?: string | null;
}

export interface PermissionOverrideInput {
  module: PermissionModule;
  view?: boolean | null;
  create?: boolean | null;
  edit?: boolean | null;
  delete?: boolean | null;
}

export const usersService = {
  list: () => api.get<ManagedUser[]>("/api/users"),
  get: (id: string) => api.get<ManagedUser>(`/api/users/${id}`),
  create: (input: CreateUserInput) => api.post<ManagedUser>("/api/users", input),
  update: (id: string, input: UpdateUserInput) => api.patch<ManagedUser>(`/api/users/${id}`, input),
  setStatus: (id: string, status: UserStatus) => api.patch<ManagedUser>(`/api/users/${id}`, { status }),
  remove: (id: string) => api.delete<{ success: boolean }>(`/api/users/${id}`),
  resetPassword: (id: string, password: string) => api.post<{ success: boolean }>(`/api/users/${id}/reset-password`, { password }),
  getPermissions: (id: string) => api.get<{ effective: PermissionMatrix; overrides: unknown[] }>(`/api/users/${id}/permissions`),
  updatePermissions: (id: string, overrides: PermissionOverrideInput[]) =>
    api.patch<{ effective: PermissionMatrix }>(`/api/users/${id}/permissions`, { overrides }),
};
