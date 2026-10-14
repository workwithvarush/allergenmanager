import type { ComponentProps } from "react";

/**
 * primary: the forest action — at most one per screen.
 * gold: reserved for the Print action.
 * danger: destructive confirmations, e.g. "Replace dish list".
 */
export type ButtonVariant = "primary" | "secondary" | "gold" | "danger";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
};

/**
 * Design-system button (`.btn` in ui_kits/allergen-manager/kit.css).
 * `disabled` fades any variant and blocks clicks.
 */
export function Button({ variant = "primary", type = "button", className, ...props }: ButtonProps) {
  const classes = ["btn", `btn-${variant}`, className].filter(Boolean).join(" ");
  return <button type={type} className={classes} {...props} />;
}
