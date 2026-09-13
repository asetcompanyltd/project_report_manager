import { api } from "./apiClient";
import type { User } from "@/types/project";

export const authService = {
  me: () => api.get<User | null>("/api/auth/me"),
  login: (email: string, password: string, remember?: boolean) =>
    api.post<User>("/api/auth/login", { email, password, remember }),
  register: (name: string, email: string, password: string) =>
    api.post<User>("/api/auth/register", { name, email, password }),
  logout: () => api.post<{ success: boolean }>("/api/auth/logout"),
};
