import { z } from "zod";
import { roleStatusValues, permissionModuleValues } from "@/db/schema";

export const createRoleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(100),
  description: z.string().trim().max(500).optional().default(""),
  status: z.enum(roleStatusValues).optional().default("Active"),
});

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  status: z.enum(roleStatusValues).optional(),
});

export const modulePermissionSchema = z.object({
  module: z.enum(permissionModuleValues),
  view: z.boolean(),
  create: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
});

export const updateRolePermissionsSchema = z.object({
  permissions: z.array(modulePermissionSchema),
});
