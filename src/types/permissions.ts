export type PermissionModule = "projects" | "users" | "roles" | "settings";
export type PermissionAction = "view" | "create" | "edit" | "delete";
export type PermissionFlags = Record<PermissionAction, boolean>;
export type PermissionMatrix = Record<PermissionModule, PermissionFlags>;

export const PERMISSION_MODULES: PermissionModule[] = ["projects", "users", "roles", "settings"];
export const PERMISSION_ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete"];

export const MODULE_LABELS: Record<PermissionModule, string> = {
  projects: "Projects",
  users: "Users",
  roles: "Roles & Permissions",
  settings: "Settings",
};
