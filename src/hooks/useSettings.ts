import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService, type UpdateSettingsInput } from "@/services/settings";

const SETTINGS_KEY = ["settings"];

export function useSettings() {
  return useQuery({ queryKey: SETTINGS_KEY, queryFn: settingsService.get });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => settingsService.update(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });
}

export function useAuditLog(page: number) {
  return useQuery({ queryKey: ["audit-log", page], queryFn: () => settingsService.auditLog(page) });
}
