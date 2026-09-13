import { z } from "zod";
import { projectStatusValues } from "@/db/schema";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(200),
  code: z
    .string()
    .trim()
    .min(1, "Project code is required")
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Code can only contain letters, numbers, hyphens and underscores"),
  description: z.string().trim().max(2000).optional().default(""),
  status: z.enum(projectStatusValues).optional().default("Active"),
});

export const updateProjectSchema = createProjectSchema.partial();
