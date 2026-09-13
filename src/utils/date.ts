const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats an ISO date (YYYY-MM-DD) as "DD-Mon-YYYY"; anything else (e.g. "Completed") passes through. */
export function fmtDate(d: string | null | undefined): string {
  if (!d) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d + "T00:00:00");
  return String(dt.getDate()).padStart(2, "0") + "-" + MONTHS[dt.getMonth()] + "-" + dt.getFullYear();
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
