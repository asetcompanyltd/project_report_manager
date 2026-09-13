export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative h-7 w-14 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-emerald-600 bg-emerald-500" : "border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-700",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-wide select-none",
          checked ? "left-2 text-white" : "right-2 text-slate-400 dark:text-slate-500",
        ].join(" ")}
      >
        {checked ? "ON" : "OFF"}
      </span>
      <span
        className={[
          "absolute top-1 size-5 rounded-full bg-white shadow-md transition-all",
          checked ? "left-8" : "left-1",
        ].join(" ")}
      />
    </button>
  );
}
