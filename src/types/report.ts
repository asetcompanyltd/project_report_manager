export type ItemStatus = "Complete" | "In Progress" | "Not Started";

export interface Phase {
  id: string;
  name: string;
  status: ItemStatus;
  progress: number;
  targetDate: string;
  remarks: string;
}

export interface SiteItem {
  id: string;
  text: string;
}

export interface Site {
  id: string;
  name: string;
  status: ItemStatus;
  progress: number;
  targetDate: string;
  items: SiteItem[];
}

export interface PhaseDetail {
  id: string;
  phaseId: string | null;
  sites: Site[];
}

export interface NextStep {
  id: string;
  text: string;
}

export interface ChangeLogEntry {
  id: string;
  ts: string;
  message: string;
}

export interface SnapshotSummary {
  id: string;
  label: string;
  createdAt: string;
}

export interface ReportMeta {
  title: string;
  subtitle: string;
  reportDate: string;
  preparedBy: string;
  logo: string | null;
}

export interface Report {
  id: string;
  meta: ReportMeta;
  notes: string;
  phases: Phase[];
  phaseDetails: PhaseDetail[];
  nextSteps: NextStep[];
  changeLog: ChangeLogEntry[];
  snapshots: SnapshotSummary[];
}

export interface ExportPayload {
  meta: ReportMeta;
  notes: string;
  phases: Phase[];
  phaseDetails: PhaseDetail[];
  nextSteps: NextStep[];
}
