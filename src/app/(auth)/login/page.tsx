"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, FileBarChart2, ShieldCheck, FolderKanban, GitBranch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ApiClientError } from "@/services/apiClient";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

const HIGHLIGHTS = [
  { icon: FolderKanban, text: "Manage unlimited independent projects in one workspace" },
  { icon: GitBranch, text: "Version history and restorable snapshots for every report" },
  { icon: ShieldCheck, text: "Project-level access control, enforced end-to-end" },
];

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password, remember);
      router.push(searchParams.get("next") || "/projects");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Branding panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-slate-900 p-12 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <FileBarChart2 className="size-6" />
          </span>
          <span className="text-lg font-bold">Report Manager</span>
        </div>

        <div className="relative">
          <h1 className="text-3xl font-bold leading-tight">
            One workspace for every project&rsquo;s status report.
          </h1>
          <p className="mt-3 max-w-md text-sm text-indigo-100">
            Track phases, site progress, and next steps for as many independent projects as you
            need, each with its own isolated data.
          </p>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-indigo-50">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <item.icon className="size-3.5" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-indigo-200">&copy; {new Date().getFullYear()} Report Manager. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FileBarChart2 className="size-5" />
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">Report Manager</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Log in to access your projects.</p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="!pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <label className="flex select-none items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="!w-auto size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
              />
              Remember me for 30 days
            </label>

            <Button type="submit" variant="primary" size="lg" loading={submitting} className="w-full">
              {submitting ? "Logging in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Create one
            </Link>
          </p>

          <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-600">Report Manager v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
