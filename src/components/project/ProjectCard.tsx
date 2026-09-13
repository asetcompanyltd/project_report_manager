"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, Pencil, Trash2, ArrowUpRight, FolderKanban } from "lucide-react";
import { Badge, type BadgeColor } from "@/components/ui/Badge";
import type { Project, ProjectStatus } from "@/types/project";

const STATUS_COLOR: Record<ProjectStatus, BadgeColor> = {
  Active: "green",
  "On Hold": "amber",
  Completed: "indigo",
  Archived: "slate",
};

export function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  const canEdit = project.role === "owner" || project.role === "editor";
  const canDelete = project.role === "owner";

  return (
    <div className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <FolderKanban className="size-[18px]" />
        </span>
        {(canEdit || canDelete) && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label="Project actions"
                className="rounded-md p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-[100] w-40 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
              >
                {canEdit && (
                  <DropdownMenu.Item
                    onSelect={() => onEdit(project)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-600 outline-none data-[highlighted]:bg-slate-100"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </DropdownMenu.Item>
                )}
                {canDelete && (
                  <DropdownMenu.Item
                    onSelect={() => onDelete(project)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-red-600 outline-none data-[highlighted]:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{project.code}</p>
      <h3 className="mt-0.5 truncate text-base font-bold text-slate-900">{project.name}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-500">{project.description || "No description."}</p>

      <div className="mt-4 flex items-center justify-between">
        <Badge color={STATUS_COLOR[project.status]}>{project.status}</Badge>
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Open
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
