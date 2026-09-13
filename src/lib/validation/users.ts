import { z } from "zod";
import { userStatusValues, permissionModuleValues } from "@/db/schema";

const usernamePattern = /^[a-zA-Z0-9_.-]+$/;

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(120),
  username: z.string().trim().max(60).regex(usernamePattern, "Only letters, numbers, dots, hyphens and underscores").optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().max(40).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().min(1, "Role is required"),
  status: z.enum(userStatusValues).optional().default("Active"),
  profileImage: z.string().max(5_000_000).nullable().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  username: z.string().trim().max(60).regex(usernamePattern).optional().nullable(),
  phone: z.string().trim().max(40).optional().nullable(),
  roleId: z.string().min(1).optional(),
  status: z.enum(userStatusValues).optional(),
  profileImage: z.string().max(5_000_000).nullable().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const permissionOverrideSchema = z.object({
  module: z.enum(permissionModuleValues),
  view: z.boolean().nullable().optional(),
  create: z.boolean().nullable().optional(),
  edit: z.boolean().nullable().optional(),
  delete: z.boolean().nullable().optional(),
});

export const updatePermissionOverridesSchema = z.object({
  overrides: z.array(permissionOverrideSchema),
});

export const themePreferenceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});
