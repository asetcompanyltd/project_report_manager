"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { authService } from "@/services/auth";
import type { ThemePreference } from "@/types/project";

const STORAGE_KEY = "wtp_theme";

function resolveIsDark(pref: ThemePreference): boolean {
  if (pref === "dark") return true;
  if (pref === "light") return false;
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeClass(pref: ThemePreference) {
  document.documentElement.classList.toggle("dark", resolveIsDark(pref));
}

interface ThemeContextValue {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  // Start at the same value the server rendered ("system") — reading localStorage synchronously here
  // would make the client's first render (real stored value) diverge from the server's (no localStorage),
  // causing a hydration mismatch in anything that renders differently per theme (e.g. the toggle's icon).
  const [theme, setThemeState] = useState<ThemePreference>("system");

  // Pick up the real stored preference once mounted (the inline script in layout.tsx already applied
  // the correct DOM class pre-hydration, so there's no visual flash — this just syncs React's own state).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
      // This is exactly what an effect is for: reading a browser-only API (localStorage) that
      // isn't available during server rendering, so it can't be read during the render itself.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setThemeState(stored);
    } catch {
      // ignore
    }
  }, []);

  // Once the logged-in user's stored preference loads, it's the source of truth (e.g. set on another device).
  const [syncedUserTheme, setSyncedUserTheme] = useState(user?.themePreference);
  if (user?.themePreference && user.themePreference !== syncedUserTheme) {
    setSyncedUserTheme(user.themePreference);
    setThemeState(user.themePreference);
  }

  useEffect(() => {
    applyThemeClass(theme);
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyThemeClass(theme);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemePreference) => {
      setThemeState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      if (user) {
        authService.updateTheme(next).catch(() => {
          // Non-critical: the choice still applies locally even if persisting it server-side fails.
        });
      }
    },
    [user]
  );

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
