import { useId, type ComponentProps, type ReactNode } from "react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = Omit<ComponentProps<"select">, "children" | "multiple"> & {
  label: ReactNode;
  options: readonly SelectOption[];
  /** Greyed-out first entry shown while nothing is chosen, e.g. "Choose a room". */
  placeholder?: string;
  /** Shown in red under the select; also marks it invalid. Replaces `hint`. */
  error?: ReactNode;
  hint?: ReactNode;
};

/**
 * Labelled dropdown — a native <select> styled as `.input` (kit.css), so
 * keyboard, screen-reader and mobile pickers work out of the box.
 */
export function Select({
  label,
  options,
  placeholder,
  error,
  hint,
  id,
  className,
  value,
  defaultValue,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;
  const message = error ?? hint;
  // Without a value, browsers pick the first enabled option; start on the placeholder instead.
  const initialValue = placeholder && value === undefined && defaultValue === undefined ? "" : defaultValue;

  return (
    <div className="field">
      <label className="field-label" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        className={["input", error ? "error" : null, className].filter(Boolean).join(" ")}
        value={value}
        defaultValue={initialValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="input-placeholder">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {message && (
        <span id={messageId} className={error ? "field-error" : "field-hint"}>
          {message}
        </span>
      )}
    </div>
  );
}
