"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { SaveStatus, type SaveState } from "@/components/SaveStatus";
import {
  hasMenuErrors,
  MAX_MENU_DISH_NAME,
  MAX_MENU_DISHES,
  MAX_MENU_NAME,
  MENU_SECTIONS,
  validateMenu,
  type MenuErrors,
  type StandardMenu,
} from "@/lib/menus";
import { saveMenu, setMenuRetired } from "./actions";
import styles from "./MenuEditor.module.css";

type DraftDish = { key: string; section: string; name: string };
type Draft = { id: string | null; name: string; dishes: DraftDish[] };

let keySeq = 0;
const newKey = () => `k${++keySeq}`;

function draftOf(menu: StandardMenu | null): Draft {
  if (!menu) return { id: null, name: "", dishes: [{ key: newKey(), section: "Starter", name: "" }] };
  return { id: menu.id, name: menu.name, dishes: menu.dishes.map((d) => ({ key: newKey(), section: d.section, name: d.name })) };
}

/** Comparable form of a draft, for "unsaved changes". */
const snapshot = (d: Draft) => JSON.stringify([d.name.trim(), d.dishes.map((x) => [x.section, x.name.trim()])]);

type MenuEditorProps = {
  venueId: string;
  venueName: string;
  /** Every menu, retired ones included. */
  menus: StandardMenu[];
  /** Menu to open first (from ?menu=), else the first one. */
  initialId: string | null;
};

/**
 * Edit the venue's standard menus: rename, add, remove and reorder dishes,
 * change sections, add menus and retire old ones. Saved explicitly — menus are
 * reference data — and only events created afterwards are affected.
 */
export function MenuEditor({ venueId, venueName, menus, initialId }: MenuEditorProps) {
  const sorted = [...menus.filter((m) => !m.retired), ...menus.filter((m) => m.retired)];
  const [selectedId, setSelectedId] = useState<string | null>(
    initialId === "new" ? null : (menus.find((m) => m.id === initialId)?.id ?? sorted[0]?.id ?? null),
  );
  const selected = menus.find((m) => m.id === selectedId) ?? null;
  const [draft, setDraft] = useState<Draft>(() => draftOf(selected));
  const [saved, setSaved] = useState(() => snapshot(draftOf(selected)));
  const [errors, setErrors] = useState<MenuErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [save, setSave] = useState<{ state: SaveState; savedAt?: Date }>({ state: "idle" });
  const [pendingSwitch, setPendingSwitch] = useState<{ id: string | null } | null>(null);
  const [pending, startTransition] = useTransition();
  const nameId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const focusDish = useRef<string | null>(null);

  const dirty = snapshot(draft) !== saved;
  const others = menus.filter((m) => m.id !== draft.id);
  const liveErrors = validateMenu(draft, others);
  const shown = showErrors ? { ...liveErrors, ...errors } : {};

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Focus a dish's name after adding or moving it.
  useEffect(() => {
    if (!focusDish.current) return;
    listRef.current?.querySelector<HTMLInputElement>(`[data-dish="${focusDish.current}"]`)?.focus();
    focusDish.current = null;
  }, [draft.dishes]);

  const open = (id: string | null) => {
    const menu = menus.find((m) => m.id === id) ?? null;
    const next = draftOf(menu);
    setSelectedId(id);
    setDraft(next);
    setSaved(snapshot(next));
    setErrors({});
    setShowErrors(false);
    setMessage(null);
    setSave({ state: "idle" });
    window.history.replaceState(null, "", `?menu=${id ?? "new"}`);
  };
  const requestOpen = (id: string | null) => (dirty ? setPendingSwitch({ id }) : open(id));

  const setDishes = (change: (dishes: DraftDish[]) => DraftDish[]) => setDraft((d) => ({ ...d, dishes: change(d.dishes) }));
  const updateDish = (key: string, patch: Partial<DraftDish>) =>
    setDishes((dishes) => dishes.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (index: number, by: -1 | 1) =>
    setDishes((dishes) => {
      const next = [...dishes];
      const [dish] = next.splice(index, 1);
      next.splice(index + by, 0, dish);
      focusDish.current = dish.key;
      return next;
    });
  const addDish = () =>
    setDishes((dishes) => {
      const key = newKey();
      focusDish.current = key;
      return [...dishes, { key, section: dishes[dishes.length - 1]?.section ?? "Main", name: "" }];
    });

  const submit = () => {
    setShowErrors(true);
    setMessage(null);
    if (hasMenuErrors(liveErrors)) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-menu-editor] [aria-invalid=true]")?.focus());
      return;
    }
    startTransition(async () => {
      setSave({ state: "saving" });
      const result = await saveMenu(venueId, {
        id: draft.id,
        name: draft.name,
        dishes: draft.dishes.map(({ section, name }) => ({ section, name })),
      }).catch(() => ({ ok: false as const, errors: {}, message: "The menu wasn't saved — the server could not be reached." }));
      if (!result.ok) {
        setErrors(result.errors);
        setMessage(result.message ?? null);
        setSave({ state: "error" });
        return;
      }
      setErrors({});
      setShowErrors(false);
      setSaved(snapshot(draft));
      setDraft((d) => ({ ...d, id: result.id }));
      setSelectedId(result.id);
      window.history.replaceState(null, "", `?menu=${result.id}`);
      setSave({ state: "saved", savedAt: new Date() });
    });
  };

  const retire = (retired: boolean) =>
    startTransition(async () => {
      if (!draft.id) return;
      setMessage(null);
      const result = await setMenuRetired(venueId, draft.id, retired).catch(() => ({
        ok: false as const,
        message: "The change wasn't saved — the server could not be reached.",
      }));
      if (!result.ok) setMessage(result.message);
    });

  const isNew = draft.id === null;
  const retired = selected?.retired ?? false;

  return (
    <div className={styles.layout}>
      <nav className={styles.menuList} aria-label="Menus">
        <ul>
          {sorted.map((menu) => (
            <li key={menu.id}>
              <button
                type="button"
                className={styles.menuItem}
                aria-current={menu.id === selectedId ? "true" : undefined}
                onClick={() => menu.id !== selectedId && requestOpen(menu.id)}
              >
                <span className={styles.menuItemName}>{menu.name}</span>
                <span className={styles.menuItemMeta}>
                  {menu.dishes.length} {menu.dishes.length === 1 ? "dish" : "dishes"}
                  {menu.retired && <span className={styles.retiredBadge}>Retired</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Button variant="secondary" className={`btn-sm ${styles.newMenu}`} onClick={() => !isNew && requestOpen(null)}>
          + New menu
        </Button>
      </nav>

      <section className={styles.editor} aria-labelledby={`${nameId}-heading`} data-menu-editor>
        <div className={styles.editorHead}>
          <h2 id={`${nameId}-heading`} className={styles.editorTitle}>
            {isNew ? "New menu" : selected?.name}
          </h2>
          {retired && <span className={styles.retiredBadge}>Retired</span>}
        </div>
        <p className={styles.note}>
          {retired
            ? "Retired — not offered for new events or menu changes. Events already using it keep their dishes."
            : `Changes apply to ${venueName} events created from now on. Events already using this menu keep their own dish list.`}
        </p>

        {message && (
          <div className="banner banner-danger" role="alert">
            <div className="banner-body">{message}</div>
          </div>
        )}

        <div className="field">
          <label className="field-label" htmlFor={nameId}>
            Menu name
          </label>
          <input
            id={nameId}
            className={`input ${shown.name ? "error" : ""} ${styles.nameInput}`}
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            maxLength={MAX_MENU_NAME}
            aria-invalid={shown.name ? true : undefined}
            aria-describedby={shown.name ? `${nameId}-error` : undefined}
            placeholder="e.g. Autumn buffet"
            autoComplete="off"
          />
          {shown.name && (
            <span id={`${nameId}-error`} className="field-error">
              {shown.name}
            </span>
          )}
        </div>

        <h3 className={styles.dishesTitle}>Dishes</h3>
        {shown.dishes && <p className="field-error">{shown.dishes}</p>}
        <ol className={styles.dishes} ref={listRef}>
          {draft.dishes.map((dish, i) => {
            const error = shown.dishNames?.[i];
            const label = dish.name.trim() || `Dish ${i + 1}`;
            return (
              <li key={dish.key} className={styles.dish}>
                <span className={styles.dishIndex} aria-hidden="true">
                  {i + 1}
                </span>
                <select
                  className={`input ${styles.section}`}
                  value={dish.section}
                  onChange={(e) => updateDish(dish.key, { section: e.target.value })}
                  aria-label={`Section, dish ${i + 1}`}
                >
                  {MENU_SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className={styles.dishNameField}>
                  <input
                    className={`input ${error ? "error" : ""}`}
                    value={dish.name}
                    onChange={(e) => updateDish(dish.key, { name: e.target.value })}
                    maxLength={MAX_MENU_DISH_NAME}
                    aria-label={`Dish ${i + 1} name`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${dish.key}-error` : undefined}
                    placeholder="Dish name"
                    data-dish={dish.key}
                    autoComplete="off"
                  />
                  {error && (
                    <span id={`${dish.key}-error`} className="field-error">
                      {error}
                    </span>
                  )}
                </div>
                <span className={styles.dishActions}>
                  <button type="button" className={styles.iconButton} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${label} up`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => move(i, 1)}
                    disabled={i === draft.dishes.length - 1}
                    aria-label={`Move ${label} down`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => setDishes((dishes) => dishes.filter((x) => x.key !== dish.key))}
                    aria-label={`Remove ${label}`}
                  >
                    ✕
                  </button>
                </span>
              </li>
            );
          })}
        </ol>
        <button type="button" className={styles.addDish} onClick={addDish} disabled={draft.dishes.length >= MAX_MENU_DISHES}>
          + Add dish
        </button>

        <div className={styles.footer}>
          <span className={styles.footerStart}>
            {!isNew && (
              <Button variant="secondary" className="btn-sm" onClick={() => retire(!retired)} disabled={pending || dirty}>
                {retired ? "Restore menu" : "Retire menu"}
              </Button>
            )}
            {dirty && <span className={styles.unsaved}>Unsaved changes</span>}
            <SaveStatus state={save.state} savedAt={save.savedAt} />
          </span>
          <span className={styles.footerEnd}>
            {dirty && (
              <Button variant="secondary" className="btn-sm" onClick={() => open(isNew ? (sorted[0]?.id ?? null) : draft.id)} disabled={pending}>
                Discard changes
              </Button>
            )}
            <Button className="btn-sm" onClick={submit} disabled={pending || (!dirty && !isNew)}>
              {pending ? "Saving…" : isNew ? "Create menu" : "Save changes"}
            </Button>
          </span>
        </div>
      </section>

      {pendingSwitch && (
        <Dialog
          open
          size="xs"
          onClose={() => setPendingSwitch(null)}
          title="Discard unsaved changes?"
          footer={
            <>
              <Button variant="secondary" onClick={() => setPendingSwitch(null)} data-autofocus>
                Keep editing
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const id = pendingSwitch.id;
                  setPendingSwitch(null);
                  open(id);
                }}
              >
                Discard changes
              </Button>
            </>
          }
        >
          <p className={styles.dialogBody}>
            Changes to {isNew ? "the new menu" : `“${selected?.name}”`} haven&apos;t been saved and will be lost.
          </p>
        </Dialog>
      )}
    </div>
  );
}
