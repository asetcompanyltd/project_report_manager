import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService, type UpdateSettingsInput, type TestEmailInput } from "@/services/settings";

const SETTINGS_KEY = ["settings"];
const BRANDING_KEY = ["settings", "branding"];

export function useSettings() {
  return useQuery({ queryKey: SETTINGS_KEY, queryFn: settingsService.get });
}

export function useBranding() {
  return useQuery({ queryKey: BRANDING_KEY, queryFn: settingsService.getBranding });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => settingsService.update(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEY });
      if (variables.key === "general") qc.invalidateQueries({ queryKey: BRANDING_KEY });
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: (input: TestEmailInput) => settingsService.sendTestEmail(input),
  });
}

export function useAuditLog(page: number) {
  return useQuery({ queryKey: ["audit-log", page], queryFn: () => settingsService.auditLog(page) });
}
