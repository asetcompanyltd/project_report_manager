import { useCallback, useEffect, useRef, useState } from "react";
import { reportService, type ImportBackupPayload } from "@/services/report";
import { ApiClientError } from "@/services/apiClient";
import { useKeyedDebounce } from "./useKeyedDebounce";
import { autoStatusFromProgress } from "@/utils/status";
import type { Report, ReportMeta, ItemStatus } from "@/types/report";

export type SaveStatus = "idle" | "saving" | "saved" | "failed";

/**
 * Mirrors the legacy tool's architecture: a single in-memory report object, updated
 * optimistically on every edit, with changes pushed to the API on a 500ms debounce.
 * Structural changes (add/remove/reorder rows) go straight to the API and then
 * re-sync the whole report, since those are discrete clicks, not continuous typing.
 */
export function useReportWorkspace(projectId: string | null) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const pendingSaves = useRef(0);
  const debounce = useKeyedDebounce(500);

  // Silent background sync after a mutation (add/remove/reorder) — never toggles
  // `loading`, so the page never unmounts back to the skeleton and loses scroll
  // position/focus for what should be a small, in-place update.
  const refresh = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await reportService.get(projectId);
      setReport(data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load report.");
    }
  }, [projectId]);

  useEffect(() => {
    // Fetching on mount/projectId-change is exactly what this effect is for; setting
    // loading/error/report state synchronously (before and after the `await`) is
    // intentional here — this is the one place that's allowed to show the skeleton.
    let cancelled = false;

    if (!projectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReport(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    reportService
      .get(projectId)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Failed to load report.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const track = useCallback(async (fn: () => Promise<void>) => {
    pendingSaves.current += 1;
    setSaveStatus("saving");
    try {
      await fn();
      pendingSaves.current -= 1;
      if (pendingSaves.current <= 0) {
        pendingSaves.current = 0;
        setSaveStatus("saved");
      }
    } catch (err) {
      pendingSaves.current = Math.max(0, pendingSaves.current - 1);
      setSaveStatus("failed");
      throw err;
    }
  }, []);

  const scheduleSave = useCallback(
    (key: string, fn: () => Promise<void>) => {
      setSaveStatus("saving");
      debounce(key, () => track(fn));
    },
    [debounce, track]
  );

  // ---- meta / notes ----
  const updateMeta = useCallback(
    (patch: Partial<ReportMeta>) => {
      if (!projectId) return;
      setReport((r) => (r ? { ...r, meta: { ...r.meta, ...patch } } : r));
      scheduleSave("meta", () => reportService.updateMeta(projectId, patch).then(() => undefined));
    },
    [projectId, scheduleSave]
  );

  const updateNotes = useCallback(
    (notes: string) => {
      if (!projectId) return;
      setReport((r) => (r ? { ...r, notes } : r));
      scheduleSave("notes", () => reportService.updateMeta(projectId, { notes }).then(() => undefined));
    },
    [projectId, scheduleSave]
  );

  const setLogo = useCallback(
    async (logo: string | null) => {
      if (!projectId) return;
      setReport((r) => (r ? { ...r, meta: { ...r.meta, logo } } : r));
      await track(() => reportService.updateMeta(projectId, { logo }).then(() => undefined));
    },
    [projectId, track]
  );

  // ---- phases ----
  const addPhase = useCallback(async () => {
    if (!projectId) return;
    await track(async () => {
      await reportService.addPhase(projectId);
      await refresh();
    });
  }, [projectId, track, refresh]);

  const updatePhaseField = useCallback(
    (phaseId: string, field: "name" | "targetDate" | "remarks", value: string) => {
      setReport((r) => (r ? { ...r, phases: r.phases.map((p) => (p.id === phaseId ? { ...p, [field]: value } : p)) } : r));
      scheduleSave(`phase:${phaseId}:${field}`, () => reportService.updatePhase(phaseId, { [field]: value }).then(() => undefined));
    },
    [scheduleSave]
  );

  const updatePhaseProgress = useCallback(
    (phaseId: string, progress: number) => {
      const status: ItemStatus = autoStatusFromProgress(progress);
      setReport((r) => (r ? { ...r, phases: r.phases.map((p) => (p.id === phaseId ? { ...p, progress, status } : p)) } : r));
      scheduleSave(`phase:${phaseId}:progress`, async () => {
        await reportService.updatePhase(phaseId, { progress });
        await refresh();
      });
    },
    [scheduleSave, refresh]
  );

  const updatePhaseStatus = useCallback(
    (phaseId: string, status: ItemStatus) => {
      setReport((r) => (r ? { ...r, phases: r.phases.map((p) => (p.id === phaseId ? { ...p, status } : p)) } : r));
      scheduleSave(`phase:${phaseId}:status`, async () => {
        await reportService.updatePhase(phaseId, { status });
        await refresh();
      });
    },
    [scheduleSave, refresh]
  );

  const removePhase = useCallback(
    async (phaseId: string) => {
      if (!projectId) return;
      try {
        await track(async () => {
          await reportService.removePhase(phaseId, false);
          await refresh();
        });
        return { ok: true as const };
      } catch (err) {
        if (err instanceof ApiClientError && err.code === "HAS_ATTACHED_SECTIONS") {
          return { ok: false as const, needsCascadeConfirm: true, message: err.message };
        }
        return { ok: false as const, needsCascadeConfirm: false, message: (err as Error).message };
      }
    },
    [projectId, track, refresh]
  );

  const removePhaseCascade = useCallback(
    async (phaseId: string) => {
      await track(async () => {
        await reportService.removePhase(phaseId, true);
        await refresh();
      });
    },
    [track, refresh]
  );

  const reorderPhase = useCallback(
    async (phaseId: string, direction: "up" | "down") => {
      await track(async () => {
        await reportService.reorderPhase(phaseId, direction);
        await refresh();
      });
    },
    [track, refresh]
  );

  // ---- phase details / sites / items ----
  const addPhaseDetail = useCallback(async () => {
    if (!projectId) return;
    await track(async () => {
      await reportService.addPhaseDetail(projectId);
      await refresh();
    });
  }, [projectId, track, refresh]);

  const linkPhaseDetail = useCallback(
    async (phaseDetailId: string, phaseId: string) => {
      await track(async () => {
        await reportService.linkPhaseDetail(phaseDetailId, phaseId);
        await refresh();
      });
    },
    [track, refresh]
  );

  const removePhaseDetail = useCallback(
    async (phaseDetailId: string) => {
      await track(async () => {
        await reportService.removePhaseDetail(phaseDetailId);
        await refresh();
      });
    },
    [track, refresh]
  );

  const reorderPhaseDetail = useCallback(
    async (phaseDetailId: string, direction: "up" | "down") => {
      await track(async () => {
        await reportService.reorderPhaseDetail(phaseDetailId, direction);
        await refresh();
      });
    },
    [track, refresh]
  );

  const addSite = useCallback(
    async (phaseDetailId: string) => {
      await track(async () => {
        await reportService.addSite(phaseDetailId);
        await refresh();
      });
    },
    [track, refresh]
  );

  const updateSiteField = useCallback(
    (phaseDetailId: string, siteId: string, field: "name" | "targetDate", value: string) => {
      setReport((r) =>
        r
          ? {
              ...r,
              phaseDetails: r.phaseDetails.map((pd) =>
                pd.id === phaseDetailId
                  ? { ...pd, sites: pd.sites.map((s) => (s.id === siteId ? { ...s, [field]: value } : s)) }
                  : pd
              ),
            }
          : r
      );
      scheduleSave(`site:${siteId}:${field}`, () => reportService.updateSite(siteId, { [field]: value }).then(() => undefined));
    },
    [scheduleSave]
  );

  const updateSiteProgress = useCallback(
    (phaseDetailId: string, siteId: string, progress: number) => {
      const status: ItemStatus = autoStatusFromProgress(progress);
      setReport((r) =>
        r
          ? {
              ...r,
              phaseDetails: r.phaseDetails.map((pd) =>
                pd.id === phaseDetailId
                  ? { ...pd, sites: pd.sites.map((s) => (s.id === siteId ? { ...s, progress, status } : s)) }
                  : pd
              ),
            }
          : r
      );
      scheduleSave(`site:${siteId}:progress`, async () => {
        await reportService.updateSite(siteId, { progress });
        await refresh();
      });
    },
    [scheduleSave, refresh]
  );

  const updateSiteStatus = useCallback(
    (phaseDetailId: string, siteId: string, status: ItemStatus) => {
      setReport((r) =>
        r
          ? {
              ...r,
              phaseDetails: r.phaseDetails.map((pd) =>
                pd.id === phaseDetailId
                  ? { ...pd, sites: pd.sites.map((s) => (s.id === siteId ? { ...s, status } : s)) }
                  : pd
              ),
            }
          : r
      );
      scheduleSave(`site:${siteId}:status`, async () => {
        await reportService.updateSite(siteId, { status });
        await refresh();
      });
    },
    [scheduleSave, refresh]
  );

  const removeSite = useCallback(
    async (siteId: string) => {
      await track(async () => {
        await reportService.removeSite(siteId);
        await refresh();
      });
    },
    [track, refresh]
  );

  const reorderSite = useCallback(
    async (siteId: string, direction: "up" | "down") => {
      await track(async () => {
        await reportService.reorderSite(siteId, direction);
        await refresh();
      });
    },
    [track, refresh]
  );

  const addSiteItem = useCallback(
    async (siteId: string) => {
      await track(async () => {
        await reportService.addSiteItem(siteId);
        await refresh();
      });
    },
    [track, refresh]
  );

  const updateSiteItem = useCallback(
    (phaseDetailId: string, siteId: string, itemId: string, text: string) => {
      setReport((r) =>
        r
          ? {
              ...r,
              phaseDetails: r.phaseDetails.map((pd) =>
                pd.id === phaseDetailId
                  ? {
                      ...pd,
                      sites: pd.sites.map((s) =>
                        s.id === siteId ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, text } : it)) } : s
                      ),
                    }
                  : pd
              ),
            }
          : r
      );
      scheduleSave(`item:${itemId}`, () => reportService.updateSiteItem(itemId, text).then(() => undefined));
    },
    [scheduleSave]
  );

  const removeSiteItem = useCallback(
    async (itemId: string) => {
      await track(async () => {
        await reportService.removeSiteItem(itemId);
        await refresh();
      });
    },
    [track, refresh]
  );

  const reorderSiteItem = useCallback(
    async (itemId: string, direction: "up" | "down") => {
      await track(async () => {
        await reportService.reorderSiteItem(itemId, direction);
        await refresh();
      });
    },
    [track, refresh]
  );

  // ---- next steps ----
  const addNextStep = useCallback(async () => {
    if (!projectId) return;
    await track(async () => {
      await reportService.addNextStep(projectId);
      await refresh();
    });
  }, [projectId, track, refresh]);

  const updateNextStep = useCallback(
    (stepId: string, text: string) => {
      setReport((r) => (r ? { ...r, nextSteps: r.nextSteps.map((s) => (s.id === stepId ? { ...s, text } : s)) } : r));
      scheduleSave(`step:${stepId}`, () => reportService.updateNextStep(stepId, text).then(() => undefined));
    },
    [scheduleSave]
  );

  const removeNextStep = useCallback(
    async (stepId: string) => {
      await track(async () => {
        await reportService.removeNextStep(stepId);
        await refresh();
      });
    },
    [track, refresh]
  );

  // ---- snapshots ----
  const createSnapshot = useCallback(
    async (label: string) => {
      if (!projectId) return;
      await track(async () => {
        await reportService.createSnapshot(projectId, label);
        await refresh();
      });
    },
    [projectId, track, refresh]
  );

  const deleteSnapshot = useCallback(
    async (snapshotId: string) => {
      await track(async () => {
        await reportService.deleteSnapshot(snapshotId);
        await refresh();
      });
    },
    [track, refresh]
  );

  const restoreSnapshot = useCallback(
    async (snapshotId: string) => {
      await track(async () => {
        await reportService.restoreSnapshot(snapshotId);
        await refresh();
      });
    },
    [track, refresh]
  );

  const importBackup = useCallback(
    async (payload: ImportBackupPayload) => {
      if (!projectId) return;
      await track(async () => {
        await reportService.importBackup(projectId, payload);
        await refresh();
      });
    },
    [projectId, track, refresh]
  );

  const clearHistory = useCallback(async () => {
    if (!projectId) return;
    await track(async () => {
      await reportService.clearHistory(projectId);
      await refresh();
    });
  }, [projectId, track, refresh]);

  return {
    report,
    loading,
    error,
    saveStatus,
    refresh,
    clearHistory,
    updateMeta,
    updateNotes,
    setLogo,
    addPhase,
    updatePhaseField,
    updatePhaseProgress,
    updatePhaseStatus,
    removePhase,
    removePhaseCascade,
    reorderPhase,
    addPhaseDetail,
    linkPhaseDetail,
    removePhaseDetail,
    reorderPhaseDetail,
    addSite,
    updateSiteField,
    updateSiteProgress,
    updateSiteStatus,
    removeSite,
    reorderSite,
    addSiteItem,
    updateSiteItem,
    removeSiteItem,
    reorderSiteItem,
    addNextStep,
    updateNextStep,
    removeNextStep,
    createSnapshot,
    deleteSnapshot,
    restoreSnapshot,
    importBackup,
  };
}

export type ReportWorkspace = ReturnType<typeof useReportWorkspace>;
