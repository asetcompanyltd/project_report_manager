import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesService, type CreateRoleInput, type ModulePermissionInput } from "@/services/roles";

const ROLES_KEY = ["roles"];

export function useRoles() {
  return useQuery({ queryKey: ROLES_KEY, queryFn: rolesService.list });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRoleInput) => rolesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateRoleInput> }) => rolesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reassignToRoleId }: { id: string; reassignToRoleId?: string }) => rolesService.remove(id, reassignToRoleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ROLES_KEY });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useRolePermissions(id: string | null) {
  return useQuery({
    queryKey: ["roles", id, "permissions"],
    queryFn: () => rolesService.getPermissions(id as string),
    enabled: !!id,
  });
}

export function useUpdateRolePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: ModulePermissionInput[] }) =>
      rolesService.updatePermissions(id, permissions),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["roles", vars.id, "permissions"] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
