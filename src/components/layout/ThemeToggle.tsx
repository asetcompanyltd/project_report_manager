"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Tooltip } from "@/components/ui/Tooltip";

const CYCLE: Record<string, "light" | "dark" | "system"> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const ICONS = { light: Sun, dark: Moon, system: Monitor };
const LABELS = { light: "Light mode", dark: "Dark mode", system: "System theme" };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = ICONS[theme];

  return (
    <Tooltip label={`${LABELS[theme]} — click to change`}>
      <button
        onClick={() => setTheme(CYCLE[theme])}
        aria-label="Toggle theme"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Icon className="size-[18px]" />
      </button>
    </Tooltip>
  );
}
