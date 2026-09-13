import { z } from "zod";

export const settingsKeySchema = z.enum(["general", "notifications", "security", "system"]);

export const generalSettingsSchema = z.object({
  systemName: z.string().trim().max(200).optional(),
  companyName: z.string().trim().max(200).optional(),
  companyInfo: z.string().trim().max(2000).optional(),
  contactEmail: z.string().trim().max(200).optional(),
  contactPhone: z.string().trim().max(60).optional(),
  dateFormat: z.string().trim().max(40).optional(),
  timeFormat: z.string().trim().max(40).optional(),
  language: z.string().trim().max(40).optional(),
});

export const notificationSettingsSchema = z.object({
  systemNotifications: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  alertOnOverdue: z.boolean().optional(),
});

export const securitySettingsSchema = z.object({
  minPasswordLength: z.coerce.number().int().min(6).max(64).optional(),
  sessionTimeoutMinutes: z.coerce.number().int().min(5).max(43200).optional(),
  requireStrongPassword: z.boolean().optional(),
});

export const systemSettingsSchema = z.object({
  auditLogEnabled: z.boolean().optional(),
  dataRetentionDays: z.coerce.number().int().min(1).max(3650).optional(),
});

export const SETTINGS_SCHEMAS = {
  general: generalSettingsSchema,
  notifications: notificationSettingsSchema,
  security: securitySettingsSchema,
  system: systemSettingsSchema,
} as const;
