import type { ExportPayload } from "@/types/report";
import { buildWordHtml } from "./wordExport";

declare global {
  interface Window {
    jspdf?: { jsPDF: new (...args: unknown[]) => JsPdfInstance };
    html2canvas?: (el: HTMLElement, opts: Record<string, unknown>) => Promise<HTMLCanvasElement>;
  }
}

interface JsPdfInstance {
  internal: { pageSize: { getWidth(): number; getHeight(): number }; getNumberOfPages(): number };
  addImage(data: string, format: string, x: number, y: number, w: number, h: number): void;
  addPage(): void;
  setPage(n: number): void;
  saveGraphicsState(): void;
  restoreGraphicsState(): void;
  setGState(state: unknown): unknown;
  GState(opts: { opacity: number }): unknown;
  save(filename: string): void;
}

function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const already = document.querySelector(`script[data-dyn-src="${src}"]`);
    if (already) {
      if (already.getAttribute("data-loaded") === "1") {
        resolve();
      } else {
        already.addEventListener("load", () => resolve());
        already.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
      }
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.dataset.dynSrc = src;
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function ensurePdfLibs() {
  if (window.jspdf && window.html2canvas) return;
  await loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await loadScriptOnce("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
  if (!window.jspdf || !window.html2canvas) throw new Error("PDF libraries failed to load");
}

function imageFormatFromDataUrl(dataUrl: string): string {
  if (/^data:image\/png/i.test(dataUrl)) return "PNG";
  if (/^data:image\/webp/i.test(dataUrl)) return "WEBP";
  return "JPEG";
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
    img.onerror = () => resolve({ width: 1, height: 1 });
    img.src = dataUrl;
  });
}

function renderHtmlToCanvas(html: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-10000px";
    iframe.style.top = "0";
    iframe.style.width = "800px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      reject(new Error("Could not create render frame"));
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      window
        .html2canvas!(doc.body, { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: 800 })
        .then((canvas) => {
          document.body.removeChild(iframe);
          resolve(canvas);
        })
        .catch((err) => {
          document.body.removeChild(iframe);
          reject(err);
        });
    }, 350);
  });
}

function safeFileTitle(base: string): string {
  return (base || "Project_Status_Report").replace(/[^a-z0-9]+/gi, "_").slice(0, 80);
}

export async function generatePdf(d: ExportPayload, labelOverride?: string): Promise<{ pdf: JsPdfInstance; filename: string }> {
  await ensurePdfLibs();
  const html = buildWordHtml(d, "canvas");
  const canvas = await renderHtmlToCanvas(html);
  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  const { jsPDF } = window.jspdf!;
  const pdf = new jsPDF("p", "pt", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  if (d.meta.logo) {
    const dims = await getImageDimensions(d.meta.logo);
    const fmt = imageFormatFromDataUrl(d.meta.logo);
    const wmWidth = pageWidth * 0.5;
    const wmHeight = wmWidth * (dims.height / dims.width);
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.saveGraphicsState();
      pdf.setGState(pdf.GState({ opacity: 0.12 }));
      pdf.addImage(d.meta.logo, fmt, (pageWidth - wmWidth) / 2, (pageHeight - wmHeight) / 2, wmWidth, wmHeight);
      pdf.restoreGraphicsState();
    }
  }

  const base = labelOverride ? `${d.meta.title}_${labelOverride}` : d.meta.title;
  return { pdf, filename: `${safeFileTitle(base)}_Status_Report.pdf` };
}

export { openPrintFallback } from "./wordExport";
