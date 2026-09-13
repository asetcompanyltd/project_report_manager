import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService, type CreateProjectInput, type UpdateProjectInput } from "@/services/projects";

const PROJECTS_KEY = ["projects"];

export function useProjects() {
  return useQuery({ queryKey: PROJECTS_KEY, queryFn: projectsService.list });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: UpdateProjectInput }) =>
      projectsService.update(projectId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectsService.remove(projectId),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}
