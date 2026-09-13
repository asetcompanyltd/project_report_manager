import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/context/QueryProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { ToastProvider } from "@/context/ToastContext";

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
              <ToastProvider>{children}</ToastProvider>
            </ProjectProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
