import type { ExportPayload, Site } from "@/types/report";
import { escHtml } from "@/utils/escape";
import { fmtDate } from "@/utils/date";
import { computeOverallProgress, isOverdue } from "@/utils/status";

function statusColor(s: string): string {
  if (s === "Complete") return "#2E7D32";
  if (s === "In Progress") return "#B8860B";
  return "#666666";
}

function buildSiteRows(sites: Site[]): string {
  return sites
    .map((site) => {
      return site.items
        .map((item, idx) => {
          if (idx === 0) {
            const overdue = isOverdue(site.targetDate, site.status);
            return (
              "<tr>" +
              `<td rowspan="${site.items.length}" style="border:1px solid #BFBFBF;padding:8px;background:#D9E2F3;"><b style="color:#1F3864">${escHtml(site.name)}</b></td>` +
              `<td style="border:1px solid #BFBFBF;padding:8px;">${escHtml(item.text)}</td>` +
              `<td rowspan="${site.items.length}" style="border:1px solid #BFBFBF;padding:8px;text-align:center;"><b style="color:${statusColor(site.status)}">${escHtml(site.status)}</b></td>` +
              `<td rowspan="${site.items.length}" style="border:1px solid #BFBFBF;padding:8px;text-align:center;"><b>${site.progress}%</b></td>` +
              `<td rowspan="${site.items.length}" style="border:1px solid #BFBFBF;padding:8px;text-align:center;">${fmtDate(site.targetDate)}${overdue ? ' <span style="color:#C0392B;font-weight:bold;">(Overdue)</span>' : ""}</td>` +
              "</tr>"
            );
          }
          return `<tr><td style="border:1px solid #BFBFBF;padding:8px;">${escHtml(item.text)}</td></tr>`;
        })
        .join("");
    })
    .join("");
}

function buildSiteSections(sites: Site[]): string {
  return sites
    .map((site) => {
      const items = site.items
        .map((i) => `<li style="margin-bottom:4px;">${escHtml(i.text)}${site.status === "In Progress" ? " — in progress" : ""}</li>`)
        .join("");
      return `<h3 style="color:#1F3864;font-size:14pt;margin-top:20px;">${escHtml(site.name)} — ${escHtml(site.status)}</h3><ul>${items}</ul>`;
    })
    .join("");
}

export type ExportVariant = "print" | "word" | "canvas";

export function buildWordHtml(d: ExportPayload, variant: ExportVariant = "print"): string {
  const hasLogo = !!d.meta.logo;
  const overall = computeOverallProgress(d.phases);

  const phaseRows = d.phases
    .map((p, i) => {
      const overdue = isOverdue(p.targetDate, p.status);
      return (
        "<tr>" +
        `<td style="border:1px solid #BFBFBF;padding:8px;text-align:center;">${i + 1}</td>` +
        `<td style="border:1px solid #BFBFBF;padding:8px;"><b>${escHtml(p.name)}</b></td>` +
        `<td style="border:1px solid #BFBFBF;padding:8px;text-align:center;"><b style="color:${statusColor(p.status)}">${escHtml(p.status)}</b></td>` +
        `<td style="border:1px solid #BFBFBF;padding:8px;text-align:center;"><b>${p.progress}%</b></td>` +
        `<td style="border:1px solid #BFBFBF;padding:8px;text-align:center;">${fmtDate(p.targetDate)}${overdue ? ' <span style="color:#C0392B;font-weight:bold;">(Overdue)</span>' : ""}</td>` +
        `<td style="border:1px solid #BFBFBF;padding:8px;">${escHtml(p.remarks)}</td>` +
        "</tr>"
      );
    })
    .join("");

  let sectionNum = 3;
  const phaseDetailsHtml = d.phaseDetails
    .map((pd) => {
      const phase = d.phases.find((p) => p.id === pd.phaseId);
      const label = (phase ? phase.name : "Unassigned Phase") + " — Site Detail";
      const html =
        `<h2 class="section">${sectionNum}. ${escHtml(label)}</h2>` +
        `<table><tr><th>Site Location</th><th>Installed Component</th><th>Status</th><th>Progress</th><th>Target Completion</th></tr>${buildSiteRows(pd.sites)}</table>` +
        buildSiteSections(pd.sites);
      sectionNum++;
      return html;
    })
    .join("");
  const nextStepsNum = sectionNum++;
  const notesNum = sectionNum++;

  const nextStepsHtml = d.nextSteps.map((s) => `<li style="margin-bottom:6px;">${escHtml(s.text)}</li>`).join("");

  const logoHtml = d.meta.logo && variant !== "word" ? `<img src="${d.meta.logo}" style="max-height:70px;display:block;margin:0 auto 12px;">` : "";

  const printWatermarkCss =
    variant === "print" && hasLogo
      ? ".watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:55%;max-width:420px;opacity:.10;z-index:-1;pointer-events:none;}"
      : "";
  const printWatermarkImg = variant === "print" && hasLogo ? `<img class="watermark" src="${d.meta.logo}" alt="">` : "";

  const bodyContent =
    logoHtml +
    `<h1>${escHtml(d.meta.title)}</h1>` +
    `<h2 class="sub">${escHtml(d.meta.subtitle)}</h2>` +
    '<p class="tag">Project Status Report — Stakeholder Update</p>' +
    '<hr style="border:1px solid #1F3864;margin:16px 0;">' +
    `<p><b>Report Date:</b> ${fmtDate(d.meta.reportDate)}</p>` +
    `<p><b>Prepared By:</b> ${escHtml(d.meta.preparedBy || "[Project Manager Name]")}</p>` +
    `<p><b>Overall Project Progress:</b> <b style="color:#B8860B">${overall}% Complete</b></p>` +
    '<h2 class="section">1. Project Overview</h2>' +
    `<p>This report summarizes the current status of the ${escHtml(d.meta.title)} project, covering progress across all project phases.</p>` +
    '<h2 class="section">2. Project Phase Status Summary</h2>' +
    `<table><tr><th>#</th><th>Project Phase</th><th>Status</th><th>Progress</th><th>Target Date</th><th>Remarks</th></tr>${phaseRows}</table>` +
    phaseDetailsHtml +
    `<h2 class="section">${nextStepsNum}. Next Steps</h2><ul>${nextStepsHtml}</ul>` +
    `<h2 class="section">${notesNum}. Notes</h2><p style="font-style:italic;">${escHtml(d.notes)}</p>`;

  const wrappedBody = printWatermarkImg + bodyContent;

  return (
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    `<head><meta charset="utf-8"><title>${escHtml(d.meta.title)}</title>` +
    "<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->" +
    "<style>" +
    "body{ font-family:Calibri, Arial, sans-serif; color:#20242C; font-size:11pt; }" +
    "table{ border-collapse:collapse; width:100%; margin-bottom:14px; }" +
    "th{ background:#1F3864; color:#fff; padding:8px; text-align:left; font-size:10.5pt; }" +
    "h1{ color:#1F3864; text-align:center; font-size:20pt; margin-bottom:2px; }" +
    "h2.sub{ color:#1F3864; text-align:center; font-size:13pt; font-weight:normal; margin:2px 0; }" +
    "p.tag{ text-align:center; color:#555; font-style:italic; font-size:11pt; margin-top:2px; }" +
    "h2.section{ color:#1F3864; font-size:15pt; border-bottom:2px solid #1F3864; padding-bottom:4px; margin-top:26px; }" +
    "@media print{ h2.section{ page-break-after:avoid; } table{ page-break-inside:auto; } tr{ page-break-inside:avoid; } }" +
    printWatermarkCss +
    "</style></head><body>" +
    wrappedBody +
    "</body></html>"
  );
}

function safeFileTitle(base: string): string {
  return (base || "Project_Status_Report").replace(/[^a-z0-9]+/gi, "_").slice(0, 80);
}

export function downloadWordDoc(d: ExportPayload, labelOverride?: string) {
  const html = buildWordHtml(d, "word");
  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const base = labelOverride ? `${d.meta.title}_${labelOverride}` : d.meta.title;
  a.href = url;
  a.download = `${safeFileTitle(base)}_Status_Report.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openPrintFallback(d: ExportPayload): boolean {
  const html = buildWordHtml(d, "print");
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    try {
      w.focus();
      w.print();
    } catch {
      // ignore
    }
  }, 400);
  return true;
}

export function buildPlainTextSummary(d: ExportPayload): string {
  const lines: string[] = [];
  lines.push(d.meta.title);
  lines.push(d.meta.subtitle);
  lines.push("Report Date: " + fmtDate(d.meta.reportDate));
  lines.push("Prepared By: " + (d.meta.preparedBy || "-"));
  lines.push("Overall Progress: " + computeOverallProgress(d.phases) + "%");
  lines.push("");
  lines.push("PHASE STATUS:");
  d.phases.forEach((p) => {
    lines.push(`- ${p.name}: ${p.status} (${p.progress}%) — Target: ${fmtDate(p.targetDate)}${p.remarks ? " — " + p.remarks : ""}`);
  });
  d.phaseDetails.forEach((pd) => {
    const phase = d.phases.find((p) => p.id === pd.phaseId);
    const label = (phase ? phase.name : "Unassigned Phase") + " — Site Detail";
    lines.push("");
    lines.push(label.toUpperCase() + ":");
    pd.sites.forEach((s) => {
      lines.push(`${s.name} — ${s.status} (${s.progress}%)`);
      s.items.forEach((i) => lines.push("   • " + i.text));
    });
  });
  lines.push("");
  lines.push("NEXT STEPS:");
  d.nextSteps.forEach((s) => lines.push("- " + s.text));
  if (d.notes) {
    lines.push("");
    lines.push("NOTES: " + d.notes);
  }
  return lines.join("\n");
}
