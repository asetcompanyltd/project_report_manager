import Link from "next/link";
import { MailQuestion, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <MailQuestion className="size-6" />
        </span>
        <h1 className="text-lg font-bold text-slate-900">Forgot your password?</h1>
        <p className="mt-2 text-sm text-slate-500">
          Self-service password reset isn&apos;t set up yet. Please contact your administrator to
          have your password reset.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
