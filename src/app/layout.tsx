import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmProvider } from "@/hooks/useConfirm";
import { TooltipProvider } from "@/components/ui/Tooltip";

export const metadata: Metadata = {
  title: "Project Report Manager",
  description: "Multi-project status report manager",
};

// Applies the stored theme before React hydrates, so there's no flash of the wrong theme.
const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var pref = localStorage.getItem("wtp_theme") || "system";
    var isDark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <ProjectProvider>
                <ToastProvider>
                  <TooltipProvider>
                    <ConfirmProvider>{children}</ConfirmProvider>
                  </TooltipProvider>
                </ToastProvider>
              </ProjectProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
