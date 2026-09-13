import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, uniqueIndex, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey();
const nowIso = () => sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`;

export const userStatusValues = ["Active", "Inactive"] as const;
export type UserStatus = (typeof userStatusValues)[number];

export const themePreferenceValues = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof themePreferenceValues)[number];

export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  // Added for RBAC/user-management: all nullable-or-defaulted so existing rows remain valid.
  username: text("username"),
  phone: text("phone"),
  roleId: text("role_id").references((): AnySQLiteColumn => roles.id, { onDelete: "set null" }),
  status: text("status").$type<UserStatus>().notNull().default("Active"),
  profileImage: text("profile_image"),
  themePreference: text("theme_preference").$type<ThemePreference>().notNull().default("system"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default(nowIso()),
}, (t) => [uniqueIndex("users_email_idx").on(t.email), uniqueIndex("users_username_idx").on(t.username)]);

export const projectStatusValues = ["Active", "On Hold", "Completed", "Archived"] as const;
export type ProjectStatus = (typeof projectStatusValues)[number];

export const projects = sqliteTable("projects", {
  id: id(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").$type<ProjectStatus>().notNull().default("Active"),
  createdBy: text("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(nowIso()),
  updatedAt: text("updated_at").notNull().default(nowIso()),
}, (t) => [uniqueIndex("projects_code_idx").on(t.code)]);

export const roleValues = ["owner", "editor", "viewer"] as const;
export type ProjectRole = (typeof roleValues)[number];

export const projectMembers = sqliteTable("project_members", {
  id: id(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").$type<ProjectRole>().notNull().default("viewer"),
  createdAt: text("created_at").notNull().default(nowIso()),
}, (t) => [uniqueIndex("project_members_unique_idx").on(t.projectId, t.userId)]);

export const reports = sqliteTable("reports", {
  id: id(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  reportDate: text("report_date").notNull().default(""),
  preparedBy: text("prepared_by").notNull().default(""),
  logo: text("logo"),
  notes: text("notes").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(nowIso()),
}, (t) => [uniqueIndex("reports_project_id_idx").on(t.projectId)]);

export const statusValues = ["Complete", "In Progress", "Not Started"] as const;
export type ItemStatus = (typeof statusValues)[number];

export const phases = sqliteTable("phases", {
  id: id(),
  reportId: text("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  status: text("status").$type<ItemStatus>().notNull().default("Not Started"),
  progress: integer("progress").notNull().default(0),
  targetDate: text("target_date").notNull().default(""),
  remarks: text("remarks").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const phaseDetails = sqliteTable("phase_details", {
  id: id(),
  reportId: text("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  phaseId: text("phase_id").references(() => phases.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const sites = sqliteTable("sites", {
  id: id(),
  phaseDetailId: text("phase_detail_id").notNull().references(() => phaseDetails.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  status: text("status").$type<ItemStatus>().notNull().default("Not Started"),
  progress: integer("progress").notNull().default(0),
  targetDate: text("target_date").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const siteItems = sqliteTable("site_items", {
  id: id(),
  siteId: text("site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  text: text("text").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const nextSteps = sqliteTable("next_steps", {
  id: id(),
  reportId: text("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  text: text("text").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const changeLog = sqliteTable("change_log", {
  id: id(),
  reportId: text("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  ts: text("ts").notNull().default(nowIso()),
  message: text("message").notNull(),
});

export const snapshots = sqliteTable("snapshots", {
  id: id(),
  reportId: text("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  createdAt: text("created_at").notNull().default(nowIso()),
  data: text("data", { mode: "json" }).notNull(),
});

// ---- RBAC: roles, permissions, audit log, app settings ----

export const roleStatusValues = ["Active", "Inactive"] as const;
export type RoleStatus = (typeof roleStatusValues)[number];

export const roles = sqliteTable("roles", {
  id: id(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").$type<RoleStatus>().notNull().default("Active"),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(nowIso()),
  updatedAt: text("updated_at").notNull().default(nowIso()),
}, (t) => [uniqueIndex("roles_name_idx").on(t.name)]);

export const permissionModuleValues = ["projects", "users", "roles", "settings"] as const;
export type PermissionModule = (typeof permissionModuleValues)[number];

export const rolePermissions = sqliteTable("role_permissions", {
  id: id(),
  roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  module: text("module").$type<PermissionModule>().notNull(),
  canView: integer("can_view", { mode: "boolean" }).notNull().default(false),
  canCreate: integer("can_create", { mode: "boolean" }).notNull().default(false),
  canEdit: integer("can_edit", { mode: "boolean" }).notNull().default(false),
  canDelete: integer("can_delete", { mode: "boolean" }).notNull().default(false),
}, (t) => [uniqueIndex("role_permissions_unique_idx").on(t.roleId, t.module)]);

// Per-user overrides: NULL on a flag means "inherit from role"; true/false explicitly overrides it.
export const userPermissionOverrides = sqliteTable("user_permission_overrides", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  module: text("module").$type<PermissionModule>().notNull(),
  canView: integer("can_view", { mode: "boolean" }),
  canCreate: integer("can_create", { mode: "boolean" }),
  canEdit: integer("can_edit", { mode: "boolean" }),
  canDelete: integer("can_delete", { mode: "boolean" }),
}, (t) => [uniqueIndex("user_permission_overrides_unique_idx").on(t.userId, t.module)]);

export const auditLog = sqliteTable("audit_log", {
  id: id(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  details: text("details").notNull().default(""),
  createdAt: text("created_at").notNull().default(nowIso()),
});

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  updatedAt: text("updated_at").notNull().default(nowIso()),
});
