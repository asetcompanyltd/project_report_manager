import { z } from "zod";
import { statusValues } from "@/db/schema";

export const reportMetaSchema = z.object({
  title: z.string().trim().max(300).optional(),
  subtitle: z.string().trim().max(300).optional(),
  reportDate: z.string().trim().max(40).optional(),
  preparedBy: z.string().trim().max(200).optional(),
  logo: z.string().max(5_000_000).nullable().optional(),
  notes: z.string().trim().max(10_000).optional(),
});

const progress = z.coerce.number().int().min(0).max(100);

export const phaseInputSchema = z.object({
  name: z.string().trim().max(300).optional(),
  status: z.enum(statusValues).optional(),
  progress: progress.optional(),
  targetDate: z.string().trim().max(40).optional(),
  remarks: z.string().trim().max(2000).optional(),
});

export const siteInputSchema = z.object({
  name: z.string().trim().max(300).optional(),
  status: z.enum(statusValues).optional(),
  progress: progress.optional(),
  targetDate: z.string().trim().max(40).optional(),
});

export const siteItemInputSchema = z.object({
  text: z.string().trim().max(500).optional(),
});

export const nextStepInputSchema = z.object({
  text: z.string().trim().max(1000).optional(),
});

export const phaseDetailInputSchema = z.object({
  phaseId: z.string().nullable().optional(),
});

export const reorderSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export const snapshotInputSchema = z.object({
  label: z.string().trim().min(1, "Version name is required").max(200),
});

export const importReportSchema = z.object({
  data: z.object({
    meta: z.object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      reportDate: z.string().optional(),
      preparedBy: z.string().optional(),
      logo: z.string().nullable().optional(),
    }).passthrough(),
    phases: z.array(z.record(z.string(), z.unknown())).default([]),
    phaseDetails: z.array(z.record(z.string(), z.unknown())).default([]),
    nextSteps: z.array(z.unknown()).default([]),
    notes: z.string().optional().default(""),
  }).passthrough(),
  snapshots: z.array(z.record(z.string(), z.unknown())).optional().default([]),
});
