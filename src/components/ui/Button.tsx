import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-solid" | "icon";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500 disabled:hover:bg-indigo-600",
  secondary:
    "bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 focus-visible:ring-indigo-500 disabled:hover:bg-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-indigo-500 disabled:hover:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800",
  danger:
    "bg-white text-red-600 border border-red-200 shadow-sm hover:bg-red-50 focus-visible:ring-red-500 disabled:hover:bg-white dark:bg-slate-800 dark:border-red-500/30 dark:hover:bg-red-500/10",
  "danger-solid":
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500 disabled:hover:bg-red-600",
  icon: "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-indigo-500 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5 rounded-md",
  md: "text-sm px-3.5 py-2 gap-2 rounded-lg",
  lg: "text-sm px-5 py-2.5 gap-2 rounded-lg",
};

const ICON_SIZE_CLASS: Record<Size, string> = {
  sm: "p-1.5 rounded-md",
  md: "p-2 rounded-lg",
  lg: "p-2.5 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading, disabled, className, children, ...rest },
  ref
) {
  const sizing = variant === "icon" ? ICON_SIZE_CLASS[size] : SIZE_CLASS[size];
  const classes = [
    "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ring-offset-white dark:ring-offset-slate-900",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "active:translate-y-px",
    VARIANT_CLASS[variant],
    sizing,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
