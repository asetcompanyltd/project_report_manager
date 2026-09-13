import { api } from "./apiClient";
import type { Report, ReportMeta, Phase, PhaseDetail, Site, SiteItem, NextStep, SnapshotSummary, ExportPayload } from "@/types/report";

type Direction = "up" | "down";

export interface ImportBackupPayload {
  data: ExportPayload;
  snapshots?: unknown[];
}

export const reportService = {
  get: (projectId: string) => api.get<Report>(`/api/projects/${projectId}/report`),
  updateMeta: (projectId: string, patch: Partial<ReportMeta & { notes: string }>) =>
    api.patch<Report>(`/api/projects/${projectId}/report`, patch),

  addPhase: (projectId: string) => api.post<Phase>(`/api/projects/${projectId}/phases`),
  updatePhase: (phaseId: string, patch: Partial<Omit<Phase, "id">>) => api.patch<Phase>(`/api/phases/${phaseId}`, patch),
  removePhase: (phaseId: string, cascade = false) =>
    api.delete<{ success: boolean; removedSections: number }>(`/api/phases/${phaseId}${cascade ? "?cascade=true" : ""}`),
  reorderPhase: (phaseId: string, direction: Direction) => api.post(`/api/phases/reorder`, { id: phaseId, direction }),

  addPhaseDetail: (projectId: string) => api.post<PhaseDetail>(`/api/projects/${projectId}/phase-details`),
  linkPhaseDetail: (phaseDetailId: string, phaseId: string | null) =>
    api.patch<PhaseDetail>(`/api/phase-details/${phaseDetailId}`, { phaseId }),
  removePhaseDetail: (phaseDetailId: string) => api.delete<{ success: boolean }>(`/api/phase-details/${phaseDetailId}`),
  reorderPhaseDetail: (phaseDetailId: string, direction: Direction) =>
    api.post(`/api/phase-details/reorder`, { id: phaseDetailId, direction }),

  addSite: (phaseDetailId: string) => api.post<Site>(`/api/phase-details/${phaseDetailId}/sites`),
  updateSite: (siteId: string, patch: Partial<Omit<Site, "id" | "items">>) => api.patch<Site>(`/api/sites/${siteId}`, patch),
  removeSite: (siteId: string) => api.delete<{ success: boolean }>(`/api/sites/${siteId}`),
  reorderSite: (siteId: string, direction: Direction) => api.post(`/api/sites/reorder`, { id: siteId, direction }),

  addSiteItem: (siteId: string) => api.post<SiteItem>(`/api/sites/${siteId}/items`),
  updateSiteItem: (itemId: string, text: string) => api.patch<SiteItem>(`/api/site-items/${itemId}`, { text }),
  removeSiteItem: (itemId: string) => api.delete<{ success: boolean }>(`/api/site-items/${itemId}`),
  reorderSiteItem: (itemId: string, direction: Direction) => api.post(`/api/site-items/reorder`, { id: itemId, direction }),

  addNextStep: (projectId: string) => api.post<NextStep>(`/api/projects/${projectId}/next-steps`),
  updateNextStep: (stepId: string, text: string) => api.patch<NextStep>(`/api/next-steps/${stepId}`, { text }),
  removeNextStep: (stepId: string) => api.delete<{ success: boolean }>(`/api/next-steps/${stepId}`),

  listSnapshots: (projectId: string) => api.get<SnapshotSummary[]>(`/api/projects/${projectId}/snapshots`),
  createSnapshot: (projectId: string, label: string) =>
    api.post<SnapshotSummary>(`/api/projects/${projectId}/snapshots`, { label }),
  getSnapshot: (snapshotId: string) =>
    api.get<{ id: string; label: string; createdAt: string; data: ExportPayload }>(`/api/snapshots/${snapshotId}`),
  deleteSnapshot: (snapshotId: string) => api.delete<{ success: boolean }>(`/api/snapshots/${snapshotId}`),
  restoreSnapshot: (snapshotId: string) => api.post<Report>(`/api/snapshots/${snapshotId}/restore`),

  importBackup: (projectId: string, payload: ImportBackupPayload) =>
    api.post<Report>(`/api/projects/${projectId}/import`, payload),

  clearHistory: (projectId: string) => api.delete<{ success: boolean }>(`/api/projects/${projectId}/change-log`),
};
