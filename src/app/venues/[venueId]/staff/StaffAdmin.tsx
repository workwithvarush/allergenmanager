"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FilterChips } from "@/components/FilterChips";
import { Select } from "@/components/Select";
import { TextField } from "@/components/TextField";
import { ROLES, type Role } from "@/lib/roles";
import {
  hasStaffErrors,
  lastManagerBlock,
  MAX_STAFF_EMAIL,
  MAX_STAFF_NAME,
  STAFF_EMAIL_DOMAIN,
  validateNewStaff,
  type StaffErrors,
  type StaffMember,
} from "@/lib/staff";
import { addStaff, changeRole, setStaffDisabled } from "./actions";
import styles from "./Staff.module.css";

/** What each role can do, in a line. */
const ROLE_SUMMARY: Record<Role, string> = {
  "Allergen Member": "Records allergens on events. No archive or reprint flags.",
  Chef: "Also creates events, flags reprints and views archives.",
  Supervisor: "Also custom and standard menus, early archives and switching venues.",
  "F&B Manager": "Everything, including totals across venues and managing staff.",
};

type Status = "active" | "disabled" | "all";

/** "15 Oct 2026" for "2026-10-15T14:02". */
const dayLabel = (at: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${at.slice(0, 10)}T00:00:00Z`),
  );

type Dialogs =
  | { kind: "add" }
  | { kind: "role"; member: StaffMember }
  | { kind: "disable"; member: StaffMember }
  | null;

/** Staff accounts: add people, change their role, disable or re-enable them. */
export function StaffAdmin({ staff, selfEmail }: { staff: StaffMember[]; selfEmail: string }) {
  const [status, setStatus] = useState<Status>("active");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<Dialogs>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const searchId = useId();

  const counts = {
    active: staff.filter((s) => !s.disabled).length,
    disabled: staff.filter((s) => s.disabled).length,
    all: staff.length,
  };
  const query = search.trim().toLowerCase();
  const shown = staff
    .filter((s) => (status === "all" ? true : status === "disabled" ? s.disabled : !s.disabled))
    .filter((s) => !query || s.name.toLowerCase().includes(query) || s.email.includes(query))
    .sort((a, b) => Number(a.disabled) - Number(b.disabled) || a.name.localeCompare(b.name));

  const done = (message: string) => {
    setDialog(null);
    setNotice(message);
  };

  return (
    <>
      <div className={styles.controls}>
        <div className={styles.search}>
          <label htmlFor={searchId} className="sr-only">
            Search staff
          </label>
          <input
            id={searchId}
            type="search"
            className="input"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={MAX_STAFF_EMAIL}
          />
        </div>
        <FilterChips<Status>
          label="Show accounts"
          value={status}
          onChange={setStatus}
          options={[
            { value: "active", label: "Active", count: counts.active },
            { value: "disabled", label: "Disabled", count: counts.disabled, tone: "danger" },
            { value: "all", label: "All", count: counts.all },
          ]}
        />
        <Button
          className={`btn-sm ${styles.add}`}
          onClick={() => {
            setNotice(null);
            setDialog({ kind: "add" });
          }}
        >
          + Add staff
        </Button>
      </div>

      <div role="status" className={styles.notice}>
        {notice && <div className="banner banner-success">{notice}</div>}
      </div>

      {shown.length === 0 ? (
        <p className={styles.empty}>
          {query ? `No ${status === "all" ? "" : `${status} `}accounts match “${search.trim()}”.` : `No ${status} accounts.`}
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Role</th>
              <th scope="col">Last change</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((member) => {
              const self = member.email === selfEmail;
              const last = member.history[member.history.length - 1];
              return (
                <tr key={member.id} className={member.disabled ? styles.disabledRow : undefined}>
                  <th scope="row" className={styles.person}>
                    <span className={styles.name}>
                      {member.name}
                      {self && <span className={styles.you}>You</span>}
                      {member.disabled && <span className={styles.disabledBadge}>Disabled</span>}
                    </span>
                    <span className={styles.email}>{member.email}</span>
                  </th>
                  <td className={styles.role}>{member.role}</td>
                  <td className={styles.last}>
                    {last && (
                      <>
                        {last.text}
                        <span className={styles.lastMeta}>
                          {dayLabel(last.at)} · {last.by}
                        </span>
                      </>
                    )}
                  </td>
                  <td className={styles.actions}>
                    {self ? (
                      <span className={styles.selfNote}>Another F&amp;B manager can change your account</span>
                    ) : (
                      <>
                        {!member.disabled && (
                          <Button
                            variant="secondary"
                            className="btn-sm"
                            onClick={() => {
                              setNotice(null);
                              setDialog({ kind: "role", member });
                            }}
                            aria-label={`Change role for ${member.name}`}
                          >
                            Change role
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          className="btn-sm"
                          onClick={() => {
                            setNotice(null);
                            setDialog({ kind: "disable", member });
                          }}
                          aria-label={`${member.disabled ? "Enable" : "Disable"} ${member.name}`}
                        >
                          {member.disabled ? "Enable" : "Disable"}
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {dialog?.kind === "add" && (
        <AddStaffDialog
          staff={staff}
          onClose={() => setDialog(null)}
          onAdded={(name, role) => {
            setStatus("active");
            setSearch("");
            done(`${name} added as ${role}. They can log in with their email at any venue.`);
          }}
        />
      )}
      {dialog?.kind === "role" && (
        <ChangeRoleDialog
          member={dialog.member}
          staff={staff}
          onClose={() => setDialog(null)}
          onChanged={(role) => done(`${dialog.member.name} is now ${role === "Allergen Member" || role === "F&B Manager" ? "an" : "a"} ${role}.`)}
        />
      )}
      {dialog?.kind === "disable" && (
        <DisableDialog
          member={dialog.member}
          staff={staff}
          onClose={() => setDialog(null)}
          onChanged={() =>
            done(
              dialog.member.disabled
                ? `${dialog.member.name}'s account is enabled. They can log in again.`
                : `${dialog.member.name}'s account is disabled. They can no longer log in.`,
            )
          }
        />
      )}
    </>
  );
}

function AddStaffDialog({
  staff,
  onClose,
  onAdded,
}: {
  staff: StaffMember[];
  onClose: () => void;
  onAdded: (name: string, role: Role) => void;
}) {
  const formId = useId();
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [showErrors, setShowErrors] = useState(false);
  const [serverErrors, setServerErrors] = useState<StaffErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const errors = validateNewStaff(form, staff);
  const shown: StaffErrors = showErrors ? { ...errors, ...serverErrors } : {};
  const set = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Drop the server's error for this field so the live check shows again.
    setServerErrors((e) => {
      const rest = { ...e };
      delete rest[key];
      return rest;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setShowErrors(true);
    setMessage(null);
    if (hasStaffErrors(errors)) {
      requestAnimationFrame(() =>
        document.getElementById(formId)?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus(),
      );
      return;
    }
    startTransition(async () => {
      const result = await addStaff(form).catch(() => ({
        ok: false as const,
        errors: {},
        message: "The account wasn't added — the server could not be reached.",
      }));
      if (result.ok) onAdded(form.name.trim(), form.role as Role);
      else {
        setServerErrors(result.errors);
        setMessage(result.message ?? null);
      }
    });
  };

  return (
    <Dialog
      open
      size="xs"
      onClose={onClose}
      eyebrow="Staff"
      title="Add staff"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={pending}>
            {pending ? "Adding…" : "Add staff"}
          </Button>
        </>
      }
    >
      <form id={formId} className={styles.form} onSubmit={submit} noValidate>
        <TextField
          label="Name"
          placeholder="e.g. Jamie Baker"
          value={form.name}
          onChange={(e) => set("name")(e.target.value)}
          maxLength={MAX_STAFF_NAME}
          error={shown.name}
          autoComplete="off"
          data-autofocus
        />
        <TextField
          label="Work email"
          type="email"
          placeholder={`name@${STAFF_EMAIL_DOMAIN}`}
          hint="They log in with this email, at any venue."
          value={form.email}
          onChange={(e) => set("email")(e.target.value)}
          maxLength={MAX_STAFF_EMAIL}
          error={shown.email}
          autoComplete="off"
        />
        <Select
          label="Role"
          placeholder="Choose a role"
          options={ROLES.map((r) => ({ value: r, label: r }))}
          value={form.role}
          onChange={(e) => set("role")(e.target.value)}
          error={shown.role}
          hint={form.role ? ROLE_SUMMARY[form.role as Role] : undefined}
        />
        {message && <ErrorMessage>{message}</ErrorMessage>}
      </form>
    </Dialog>
  );
}

function ChangeRoleDialog({
  member,
  staff,
  onClose,
  onChanged,
}: {
  member: StaffMember;
  staff: StaffMember[];
  onClose: () => void;
  onChanged: (role: Role) => void;
}) {
  const formId = useId();
  const [role, setRole] = useState<Role>(member.role);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const blocked = lastManagerBlock(member, { role }, staff);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (role === member.role || blocked) return;
    startTransition(async () => {
      const result = await changeRole(member.id, role).catch(() => ({
        ok: false as const,
        message: "The role wasn't changed — the server could not be reached.",
      }));
      if (result.ok) onChanged(role);
      else setMessage(result.message);
    });
  };

  return (
    <Dialog
      open
      size="xs"
      onClose={onClose}
      eyebrow={member.name}
      title="Change role"
      subtitle={`Currently ${member.role}. Takes effect the next time they log in.`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={pending || role === member.role || Boolean(blocked)}>
            {pending ? "Saving…" : "Change role"}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit}>
        <fieldset className={styles.roleOptions}>
          <legend className="sr-only">Role</legend>
          {ROLES.map((option) => (
            <label key={option} className={styles.roleOption}>
              <input
                type="radio"
                name="role"
                value={option}
                checked={role === option}
                onChange={() => {
                  setRole(option);
                  setMessage(null);
                }}
                data-autofocus={role === option ? true : undefined}
              />
              <span>
                <span className={styles.roleName}>
                  {option}
                  {option === member.role && <span className={styles.current}> · current</span>}
                </span>
                <span className={styles.roleSummary}>{ROLE_SUMMARY[option]}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {(blocked ?? message) && <ErrorMessage>{blocked ?? message}</ErrorMessage>}
      </form>
    </Dialog>
  );
}

function DisableDialog({
  member,
  staff,
  onClose,
  onChanged,
}: {
  member: StaffMember;
  staff: StaffMember[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const enabling = member.disabled;
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const blocked = lastManagerBlock(member, { disabled: !enabling }, staff);

  const confirm = () =>
    startTransition(async () => {
      const result = await setStaffDisabled(member.id, !enabling).catch(() => ({
        ok: false as const,
        message: "Nothing was changed — the server could not be reached.",
      }));
      if (result.ok) onChanged();
      else setMessage(result.message);
    });

  return (
    <Dialog
      open
      size="xs"
      onClose={onClose}
      eyebrow={member.name}
      title={enabling ? "Enable account?" : "Disable account?"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} data-autofocus>
            Cancel
          </Button>
          <Button variant={enabling ? "primary" : "danger"} onClick={confirm} disabled={pending || Boolean(blocked)}>
            {pending ? "Saving…" : enabling ? "Enable account" : "Disable account"}
          </Button>
        </>
      }
    >
      <p className={styles.dialogText}>
        {enabling
          ? `${member.name} (${member.email}) will be able to log in again as ${member.role}.`
          : `${member.name} (${member.email}) won't be able to log in at any venue. Their name stays on change logs and archives, and you can enable the account again later.`}
      </p>
      {(blocked ?? message) && <ErrorMessage>{blocked ?? message}</ErrorMessage>}
    </Dialog>
  );
}
