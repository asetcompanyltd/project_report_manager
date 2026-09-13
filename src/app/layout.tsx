import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmProvider } from "@/hooks/useConfirm";
import { TooltipProvider } from "@/components/ui/Tooltip";

export const metadata: Metadata = {
  title: "Project Report Manager",
  description: "Multi-project status report manager",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <ProjectProvider>
              <ToastProvider>
                <TooltipProvider>
                  <ConfirmProvider>{children}</ConfirmProvider>
                </TooltipProvider>
              </ToastProvider>
            </ProjectProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
