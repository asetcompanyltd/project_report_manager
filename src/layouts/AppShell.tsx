"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProjectSelector } from "@/components/project/ProjectSelector";
import { Button } from "@/components/ui/Button";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <>
      <header className="app-header">
        <Link href="/projects" className="brand">
          Project Report Manager
        </Link>
        <ProjectSelector />
        <div className="spacer" />
        {user && <span className="user-name">{user.name}</span>}
        <Button variant="ghost" onClick={handleLogout}>
          Log out
        </Button>
      </header>
      {children}
    </>
  );
}
