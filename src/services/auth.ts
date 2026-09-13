import { api } from "./apiClient";
import type { User, ThemePreference } from "@/types/project";

export const authService = {
  me: () => api.get<User | null>("/api/auth/me"),
  login: (email: string, password: string, remember?: boolean) =>
    api.post<{ id: string; email: string; name: string }>("/api/auth/login", { email, password, remember }),
  register: (name: string, email: string, password: string) =>
    api.post<{ id: string; email: string; name: string }>("/api/auth/register", { name, email, password }),
  logout: () => api.post<{ success: boolean }>("/api/auth/logout"),
  updateTheme: (theme: ThemePreference) => api.patch<{ theme: ThemePreference }>("/api/users/me/theme", { theme }),
};
