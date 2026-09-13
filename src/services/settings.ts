import { api } from "./apiClient";

export interface GeneralSettings {
  systemName: string;
  companyName: string;
  companyInfo: string;
  contactEmail: string;
  contactPhone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
}

export interface NotificationSettings {
  systemNotifications: boolean;
  emailNotifications: boolean;
  alertOnOverdue: boolean;
}

export interface SecuritySettings {
  minPasswordLength: number;
  sessionTimeoutMinutes: number;
  requireStrongPassword: boolean;
}

export interface SystemSettings {
  auditLogEnabled: boolean;
  dataRetentionDays: number;
}

export interface AllSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  system: SystemSettings;
}

export type SettingsKey = keyof AllSettings;

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  userName: string | null;
}

export type SettingsValues = Partial<GeneralSettings> | Partial<NotificationSettings> | Partial<SecuritySettings> | Partial<SystemSettings>;

export interface UpdateSettingsInput {
  key: SettingsKey;
  values: SettingsValues;
}

export interface Branding {
  systemName: string;
  companyName: string;
}

export const settingsService = {
  get: () => api.get<AllSettings>("/api/settings"),
  update: (input: UpdateSettingsInput) => api.patch<{ key: SettingsKey; values: SettingsValues }>("/api/settings", input),
  auditLog: (page = 1) => api.get<{ entries: AuditLogEntry[]; page: number; pageSize: number }>(`/api/audit-log?page=${page}`),
  getBranding: () => api.get<Branding>("/api/settings/branding"),
};
