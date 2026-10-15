"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Select } from "@/components/Select";
import { TextField } from "@/components/TextField";
import { isIsoDate } from "@/lib/dates";
import type { StandardMenu } from "@/lib/menus";
import {
  MAX_DISHES,
  MAX_GUESTS,
  validateNewEvent,
  type NewEventErrors,
  type NewEventField,
  type NewEventInput,
} from "@/lib/new-event";
import { formatDayLong } from "@/lib/venue-time";
import { ROOMS } from "@/lib/venues";
import { createEvent } from "./actions";
import styles from "./NewEventDialog.module.css";

const ROOM_OPTIONS = ROOMS.map((room) => ({ value: room, label: room }));

type NewEventDialogProps = {
  venueId: string;
  /** Date the form starts on, e.g. the day picked in the calendar. */
  defaultDate: string;
  /** Today in UK time, to label the date "today". */
  today: string;
  /** EMCC picks a standard menu; Bramleys builds every menu dish by dish. */
  standardMenus: boolean;
  /** The venue's menus that can be chosen (not retired), as edited in Menus. */
  menus: readonly StandardMenu[];
  /** Whether "Custom menu" is offered alongside the standard menus (Supervisor, F&B Manager). */
  canCustomMenu: boolean;
  onClose: () => void;
  onCreated: (event: { id: string; name: string; date: string }) => void;
};

/**
 * The prototype's "Create event" form. Mount it to open it, so every opening
 * starts from a fresh form. Errors show once a field is left or on submit.
 */
export function NewEventDialog({
  venueId,
  defaultDate,
  today,
  standardMenus,
  menus,
  canCustomMenu,
  onClose,
  onCreated,
}: NewEventDialogProps) {
  const menuIds = menus.map((m) => m.id);
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState<NewEventInput>({
    name: "",
    date: defaultDate,
    room: ROOMS[0],
    time: "12:30",
    guests: "",
    menu: standardMenus ? (menus[0]?.id ?? (canCustomMenu ? "custom" : "")) : "custom",
    customName: "",
    numDishes: "",
  });
  const [touched, setTouched] = useState<Partial<Record<NewEventField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<NewEventErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [submitCount, setSubmitCount] = useState(0);
  const [pending, startTransition] = useTransition();

  const errors = { ...validateNewEvent(form, { standardMenus, today, menuIds }), ...serverErrors };
  const shown = (field: NewEventField) => (touched[field] ? errors[field] : undefined);
  const custom = !standardMenus || form.menu === "custom";
  const menu = custom ? undefined : menus.find((m) => m.id === form.menu);
  // Only a valid count is previewed ("2.5" or "-1" show as 0).
  const dishCount = errors.numDishes ? 0 : Number(form.numDishes);

  const set = (field: NewEventField) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    // A server error (e.g. duplicate name) no longer applies once the field changes.
    setServerErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };
  const touch = (field: NewEventField) => () => {
    // Leaving a field because the dialog is closing isn't a reason to show its error.
    if (!formRef.current?.closest("dialog")?.open) return;
    setTouched((current) => ({ ...current, [field]: true }));
  };

  // After a failed submit, take focus to the first field that needs fixing,
  // or bring the form-wide message (announced as an alert) into view.
  useEffect(() => {
    if (submitCount === 0) return;
    const invalid = formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]");
    if (invalid) invalid.focus();
    else formRef.current?.querySelector("[role=alert]")?.scrollIntoView({ block: "nearest" });
  }, [submitCount]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    setMessage(null);
    setTouched({ name: true, date: true, room: true, time: true, guests: true, menu: true, customName: true, numDishes: true });
    if (Object.keys(validateNewEvent(form, { standardMenus, today, menuIds })).length > 0) {
      setSubmitCount((n) => n + 1);
      return;
    }
    startTransition(async () => {
      try {
        const result = await createEvent(venueId, form);
        if (result.ok) {
          onCreated(result.event);
          return;
        }
        setServerErrors(result.errors);
        setMessage(result.message ?? null);
        setSubmitCount((n) => n + 1);
      } catch {
        setMessage("Event not created — the server could not be reached. The form is unchanged, so it can be sent again.");
        setSubmitCount((n) => n + 1);
      }
    });
  };

  return (
    <Dialog
      open
      onClose={onClose}
      size="md"
      eyebrow="New event"
      title="Create event"
      subtitle={dateLabel(form.date, today)}
      footer={
        <>
          <span className="dialog-foot-note">Defaults can be changed any time from the event row</span>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={pending}>
            {pending ? "Creating…" : "Create event"}
          </Button>
        </>
      }
    >
      <form id={formId} ref={formRef} className={styles.form} onSubmit={submit} noValidate>
        {message && (
          <div className="banner banner-danger" role="alert">
            <div className="banner-body">{message}</div>
          </div>
        )}

        <div className={styles.fields}>
          <div className={styles.full}>
            <TextField
              label="Event name"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              onBlur={touch("name")}
              placeholder="e.g. Quarterly partner briefing"
              error={shown("name")}
              hint="Visible on every printed document"
              maxLength={120}
              autoComplete="off"
              data-autofocus
            />
          </div>
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => set("date")(e.target.value)}
            onBlur={touch("date")}
            error={shown("date")}
          />
          <Select
            label="Room"
            options={ROOM_OPTIONS}
            value={form.room}
            onChange={(e) => set("room")(e.target.value)}
            error={shown("room")}
          />
          <TextField
            label="Service time"
            type="time"
            value={form.time}
            onChange={(e) => set("time")(e.target.value)}
            onBlur={touch("time")}
            error={shown("time")}
            hint="24h clock"
          />
          <TextField
            label="Guests"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_GUESTS}
            value={form.guests}
            onChange={(e) => set("guests")(e.target.value)}
            onBlur={touch("guests")}
            placeholder="e.g. 84"
            error={shown("guests")}
          />
        </div>

        {standardMenus && (
          <fieldset
            className={styles.menus}
            aria-describedby={shown("menu") ? `${formId}-menu-error` : undefined}
          >
            <legend className={styles.menusTitle}>Starting menu</legend>
            <p className={styles.menusHint}>
              Pick the standard menu to seed this event&apos;s dish list. Review every dish before printing.
            </p>
            <div className={styles.menuCards}>
              {menus.map((m) => (
                <label key={m.id} className={styles.menuCard}>
                  <input
                    type="radio"
                    name="menu"
                    value={m.id}
                    checked={form.menu === m.id}
                    onChange={() => set("menu")(m.id)}
                    className="sr-only"
                  />
                  <span className={styles.menuName}>{m.name}</span>
                  <span className={styles.menuMeta}>{m.dishes.length} dishes</span>
                  <span className={styles.menuDishes}>
                    {m.dishes
                      .slice(0, 3)
                      .map((d) => d.name)
                      .join(" · ")}
                    {m.dishes.length > 3 ? ` · +${m.dishes.length - 3} more` : ""}
                  </span>
                </label>
              ))}
              {canCustomMenu && (
                <label className={styles.menuCard}>
                  <input
                    type="radio"
                    name="menu"
                    value="custom"
                    checked={form.menu === "custom"}
                    onChange={() => set("menu")("custom")}
                    className="sr-only"
                  />
                  <span className={styles.menuName}>Custom menu</span>
                  <span className={styles.menuMeta}>Supervisor · F&amp;B Manager only</span>
                  <span className={styles.menuDishes}>
                    Name the menu and set how many dishes it holds. Every dish starts blank.
                  </span>
                </label>
              )}
            </div>
            {shown("menu") && (
              <p id={`${formId}-menu-error`} className="field-error">
                {shown("menu")}
              </p>
            )}
          </fieldset>
        )}

        {custom && (
          <div className={styles.custom}>
            <p className={styles.customNote}>
              {standardMenus
                ? "Custom menus are created by supervisors and F&B managers. Name the menu and set how many dishes it holds — each one starts blank."
                : "Bramleys events are built dish by dish. Name the menu and set how many dishes it holds."}
            </p>
            <TextField
              label="Menu name"
              value={form.customName}
              onChange={(e) => set("customName")(e.target.value)}
              onBlur={touch("customName")}
              placeholder="e.g. Bramleys summer set"
              error={shown("customName")}
              maxLength={80}
              autoComplete="off"
            />
            <TextField
              label="Number of dishes"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_DISHES}
              value={form.numDishes}
              onChange={(e) => set("numDishes")(e.target.value)}
              onBlur={touch("numDishes")}
              placeholder="e.g. 6"
              error={shown("numDishes")}
            />
          </div>
        )}

        <div className="banner banner-info">
          <div className="banner-body">
            {custom
              ? `${dishCount} blank ${dishCount === 1 ? "dish" : "dishes"} will be created for ${form.customName.trim() || "this custom menu"}. Name each dish and enter its allergens on the entry screen before printing.`
              : `${menu?.dishes.length ?? 0} dishes will be added from ${menu?.name ?? "the selected menu"}. Each dish starts blank — the chef enters and checks its allergens before service.`}
          </div>
        </div>
      </form>
    </Dialog>
  );
}

/** "Wednesday 21 October", with the year when it isn't this year and "· today" for today. */
function dateLabel(date: string, today: string): string {
  if (!isIsoDate(date)) return "No date set";
  const year = date.slice(0, 4) === today.slice(0, 4) ? "" : ` ${date.slice(0, 4)}`;
  return `${formatDayLong(date)}${year}${date === today ? " · today" : ""}`;
}
