import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  usersService,
  type CreateUserInput,
  type UpdateUserInput,
  type PermissionOverrideInput,
} from "@/services/users";
import type { UserStatus } from "@/types/project";

const USERS_KEY = ["users"];

export function useUsers() {
  return useQuery({ queryKey: USERS_KEY, queryFn: usersService.list });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => usersService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => usersService.setStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => usersService.resetPassword(id, password),
  });
}

export function useUserPermissions(id: string | null) {
  return useQuery({
    queryKey: ["users", id, "permissions"],
    queryFn: () => usersService.getPermissions(id as string),
    enabled: !!id,
  });
}

export function useUpdateUserPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, overrides }: { id: string; overrides: PermissionOverrideInput[] }) =>
      usersService.updatePermissions(id, overrides),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["users", vars.id, "permissions"] }),
  });
}
