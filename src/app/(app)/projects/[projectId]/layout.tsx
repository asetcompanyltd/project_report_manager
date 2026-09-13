"use client";

import { useEffect, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useProjectContext } from "@/context/ProjectContext";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  const params = useParams<{ projectId: string }>();
  const { setCurrentProjectId } = useProjectContext();

  useEffect(() => {
    if (params.projectId) setCurrentProjectId(params.projectId);
  }, [params.projectId, setCurrentProjectId]);

  return <>{children}</>;
}
