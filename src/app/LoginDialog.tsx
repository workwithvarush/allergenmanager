"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TextField } from "@/components/TextField";
import { ROLES, type Role } from "@/lib/roles";
import type { Venue } from "@/lib/venues";
import styles from "./LoginDialog.module.css";

export type LoginDetails = {
  name: string;
  role: Role;
  /** Lower-cased @nottinghamvenues.com address. */
  email: string;
  password: string;
};

type LoginDialogProps = {
  venue: Venue;
  open: boolean;
  onClose: () => void;
  /** Called with valid details. Throw an Error to show its message in the dialog. */
  onLogIn: (details: LoginDetails) => void | Promise<void>;
};

const EMAIL_DOMAIN = /^[^\s@]+@nottinghamvenues\.com$/;

/**
 * Shared-venue login from the prototype: name, role, email and email password.
 * Log in stays disabled until every field is filled, with the missing ones
 * listed beside it.
 */
export function LoginDialog({ venue, open, onClose, onLogIn }: LoginDialogProps) {
  const formId = useId();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const missing = [
    !name.trim() && "your name",
    !role && "your role",
    !email.trim() && "email",
    !password && "password",
  ].filter((item): item is string => Boolean(item));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (missing.length || !role || pending) return;
    const normalisedEmail = email.trim().toLowerCase();
    if (!EMAIL_DOMAIN.test(normalisedEmail)) {
      setError("Email must be a nottinghamvenues.com address.");
      return;
    }
    setPending(true);
    try {
      await onLogIn({ name: name.trim(), role, email: normalisedEmail, password });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Log in failed. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xs"
      eyebrow="Shared venue login"
      title={`Log in to ${venue.name}`}
      footer={
        <>
          <span className="dialog-foot-note" aria-live="polite">
            {missing.length > 0 && `Still required: ${missing.join(", ")}`}
          </span>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={missing.length > 0 || pending}>
            {pending ? "Logging in…" : "Log in"}
          </Button>
        </>
      }
    >
      <form id={formId} className={styles.form} onSubmit={submit} noValidate>
        <TextField
          label="Your name"
          placeholder="e.g. Jamie Baker"
          hint="Tracked individually on this shared venue login."
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-autofocus
        />
        <fieldset className={styles.roles}>
          <legend className="field-label" style={{ padding: 0, marginBottom: 5 }}>
            Your role
          </legend>
          <div className={styles.segments}>
            {ROLES.map((option, index) => {
              const id = `${formId}-role-${index}`;
              return (
                <div key={option} className={styles.segment}>
                  <input
                    type="radio"
                    id={id}
                    name="role"
                    value={option}
                    className="sr-only"
                    checked={role === option}
                    onChange={() => {
                      setRole(option);
                      setError(null);
                    }}
                  />
                  <label htmlFor={id}>{option}</label>
                </div>
              );
            })}
          </div>
        </fieldset>
        <TextField
          label={role === "Allergen Member" ? "Line supervisor email" : "Your email"}
          type="email"
          placeholder="name@nottinghamvenues.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
        />
        <TextField
          label="Email password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </form>
    </Dialog>
  );
}
