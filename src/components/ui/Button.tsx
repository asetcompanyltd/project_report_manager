import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  icon: "btn-icon",
};

export function Button({ variant = "ghost", className, ...rest }: ButtonProps) {
  const classes = [VARIANT_CLASS[variant], className].filter(Boolean).join(" ");
  return <button className={classes} {...rest} />;
}
