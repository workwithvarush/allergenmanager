import { useId, type ComponentProps, type ReactNode } from "react";

type TextFieldProps = Omit<ComponentProps<"input">, "children"> & {
  label: ReactNode;
  /** Shown in red under the input; also marks the input invalid. Replaces `hint`. */
  error?: ReactNode;
  /** Helper text under the input, e.g. "Visible on every printed document". */
  hint?: ReactNode;
};

/**
 * Labelled text input (`.field` / `.input` in ui_kits/allergen-manager/kit.css).
 * Accepts every <input> prop, so it also covers email and password fields.
 */
export function TextField({ label, error, hint, id, className, type = "text", ...props }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className="field">
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className={["input", error ? "error" : null, className].filter(Boolean).join(" ")}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...props}
      />
      {message && (
        <span id={messageId} className={error ? "field-error" : "field-hint"}>
          {message}
        </span>
      )}
    </div>
  );
}
