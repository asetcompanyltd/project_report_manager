export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Archived";
export type ProjectRole = "owner" | "editor" | "viewer";

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  role: ProjectRole;
}

export type UserStatus = "Active" | "Inactive";
export type ThemePreference = "light" | "dark" | "system";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string | null;
  roleId: string | null;
  roleName: string | null;
  status: UserStatus;
  profileImage: string | null;
  themePreference: ThemePreference;
  permissions: import("./permissions").PermissionMatrix;
}
