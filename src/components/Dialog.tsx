"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type DialogProps = {
  open: boolean;
  /** Called on the close button, Esc, or a click on the backdrop. */
  onClose: () => void;
  title: ReactNode;
  /** Small uppercase label above the title, e.g. "New event". */
  eyebrow?: ReactNode;
  /** Mono line under the title, e.g. "Wednesday 20 May · today". */
  subtitle?: ReactNode;
  /** Buttons along the bottom, right-aligned. */
  footer?: ReactNode;
  /** "xs" (380px) for login, "sm" (480px) for short forms, "md" (640px) for New event. */
  size?: "xs" | "sm" | "md";
  children?: ReactNode;
};

/**
 * Modal pop-up on the native <dialog> element, which supplies the backdrop,
 * Esc handling, focus trapping and focus return. Controlled: the parent owns
 * `open` and decides what happens in `onClose`.
 *
 * Focus starts on the first element marked `data-autofocus`, else on ✕.
 */
export function Dialog({ open, onClose, title, eyebrow, subtitle, footer, size = "sm", children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
    // Close when unmounted or hidden (Next keeps visited routes in a hidden <Activity>):
    // a modal left open off-screen would make the rest of the page inert.
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={size === "sm" ? "dialog" : `dialog dialog-${size}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Esc: leave closing to the parent so `open` stays the source of truth.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // The panel's sections cover the whole box, so a click landing on
        // <dialog> itself can only be on the backdrop.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-head">
        <div>
          {eyebrow && <div className="dialog-eyebrow">{eyebrow}</div>}
          <h2 id={titleId} className="dialog-title">
            {title}
          </h2>
          {subtitle && <div className="dialog-sub">{subtitle}</div>}
        </div>
        <button type="button" className="dialog-close" aria-label="Close" onClick={onClose}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
      <div className="dialog-body">{children}</div>
      {footer && <div className="dialog-foot">{footer}</div>}
    </dialog>
  );
}
