import type { ComponentProps } from "react";

export type ButtonVariant = "primary" | "secondary";

type ButtonProps = ComponentProps<"button"> & {
  /** "primary" is the forest action; use at most one per screen. */
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
