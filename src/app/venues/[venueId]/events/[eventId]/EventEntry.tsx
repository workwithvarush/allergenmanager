"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/ProgressBar";
import { SaveStatus, type SaveState } from "@/components/SaveStatus";
import { allergenLabel, type AllergenId } from "@/lib/allergens";
import {
  completeBlockedReason,
  dishesDone,
  eventDateLabel,
  MAX_DISH_NAME,
  menuLabel,
  printBlockedReason,
  type AllergenEvent,
  type AllergenMark,
  type DietaryTag,
  type Dish,
} from "@/lib/events";
import type { StandardMenu } from "@/lib/menus";
import { usesStandardMenus } from "@/lib/venues";
import { ChangeMenuDialog } from "../../ChangeMenuDialog";
import {
  addDish,
  changeMenu,
  removeDish,
  renameDish,
  setAllergen,
  setComplete,
  setNote,
  setTag,
  type SaveResult,
} from "./actions";
import { conflictingTags } from "@/lib/dietary-tags";
import { MAX_DISHES } from "@/lib/new-event";
import { AllergenGrid, cellSelector } from "./AllergenGrid";
import { DietaryTags, TagConflicts } from "./DietaryTags";
import { NoteEditor } from "./NoteEditor";
import { RemoveDishDialog } from "./RemoveDishDialog";
import styles from "./EventEntry.module.css";

/** How long typing in a dish name pauses before it is saved. */
const NAME_SAVE_DELAY_MS = 800;
/** Cells cycle with repeated clicks; wait for them to stop so only the final state is saved. */
const ALLERGEN_SAVE_DELAY_MS = 600;
/** Same for tag toggles. */
const TAG_SAVE_DELAY_MS = 400;

const NEXT_MARK: Record<AllergenMark | "none", AllergenMark | "none"> = {
  none: "present",
  present: "may",
  may: "none",
};

type SaveOp = () => Promise<SaveResult>;

type DishStatus = "complete" | "in-progress" | "empty";

const DISH_STATUS: Record<DishStatus, { label: string; className: string }> = {
  complete: { label: "Complete", className: "badge-ready" },
  "in-progress": { label: "In progress", className: "badge-warn" },
  empty: { label: "Empty", className: "badge-neutral" },
};

/** As in the prototype: "Empty" until any allergen, tag or may-contain note is entered. */
function dishStatus(dish: Dish): DishStatus {
  if (dish.complete) return "complete";
  const entered = Object.keys(dish.allergens).length > 0 || dish.tags.length > 0 || dish.mayContain.trim() !== "";
  return entered ? "in-progress" : "empty";
}

/**
 * The allergen entry screen's dish list. Every change is saved straight away
 * (dish names after a short pause in typing) and the version stamp updates.
 */
export function EventEntry({ initialEvent, menus }: { initialEvent: AllergenEvent; menus: StandardMenu[] }) {
  const [event, setEvent] = useState(initialEvent);
  const [save, setSave] = useState<{ state: SaveState; savedAt?: Date; message?: string }>({ state: "idle" });
  /** The dish whose removal is being confirmed. */
  const [removing, setRemoving] = useState<string | null>(null);
  const [changingMenu, setChangingMenu] = useState(false);
  const [menuPending, setMenuPending] = useState(false);
  /** The allergen note being edited; one at a time, as in the prototype. */
  const [noteEditing, setNoteEditing] = useState<{ dishId: string; allergen: AllergenId } | null>(null);

  const eventRef = useRef(event);
  const pendingSaves = useRef(0);
  const failedSaves = useRef<SaveOp[]>([]);
  /** Saves waiting for a pause in typing or clicking, by key (e.g. "name:d1", "allergen:d1:gluten"). */
  const scheduled = useRef(new Map<string, { op: SaveOp; timer: ReturnType<typeof setTimeout> }>());
  const focusAfterRender = useRef<string | null>(null);

  useEffect(() => {
    eventRef.current = event;
  }, [event]);

  // Move focus after adding or removing a dish, once the list has re-rendered.
  useEffect(() => {
    const target = focusAfterRender.current;
    if (!target) return;
    focusAfterRender.current = null;
    const element = document.querySelector<HTMLElement>(target);
    // Bring the whole dish card into view (its grid too), clear of the sticky footer.
    element?.focus({ preventScroll: true });
    element?.closest("li")?.scrollIntoView({ block: "nearest" });
  }, [event.dishes]);

  // Warn before leaving while a change is unsaved.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingSaves.current > 0 || failedSaves.current.length > 0 || scheduled.current.size > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const runSave = async (op: SaveOp) => {
    pendingSaves.current += 1;
    setSave({ state: "saving" });
    let result: SaveResult;
    try {
      result = await op();
    } catch {
      result = { ok: false, message: "The server could not be reached." };
    }
    pendingSaves.current -= 1;
    if (result.ok) {
      const { version, lastModifiedAt } = result;
      setEvent((current) => ({ ...current, version, lastModifiedAt }));
    } else {
      failedSaves.current.push(op);
    }
    if (pendingSaves.current > 0) return;
    setSave(
      failedSaves.current.length > 0
        ? { state: "error", message: result.ok ? undefined : result.message }
        : { state: "saved", savedAt: new Date() },
    );
  };

  const retry = () => {
    const ops = failedSaves.current;
    failedSaves.current = [];
    ops.forEach((op) => runSave(op));
  };

  /** Sends a scheduled save now, if one is waiting. */
  const flush = (key: string) => {
    const entry = scheduled.current.get(key);
    if (!entry) return;
    clearTimeout(entry.timer);
    scheduled.current.delete(key);
    runSave(entry.op);
  };

  /**
   * Saves after `delay` ms without another change to the same thing, so typing a
   * name or clicking a cell twice sends one save. The op reads the latest state
   * when it runs, so it (and any retry) sends the current value.
   */
  const schedule = (key: string, op: SaveOp, delay: number) => {
    clearTimeout(scheduled.current.get(key)?.timer);
    scheduled.current.set(key, { op, timer: setTimeout(() => flush(key), delay) });
  };

  // Leaving the page (e.g. Back to dashboard) sends anything still waiting.
  useEffect(() => {
    const waiting = scheduled.current;
    return () => {
      for (const key of [...waiting.keys()]) flush(key);
    };
    // flush only touches refs and state setters, so the first render's copy is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDishes = (change: (dishes: Dish[]) => Dish[]) =>
    setEvent((current) => ({ ...current, dishes: change(current.dishes) }));

  const latestDish = (dishId: string) => eventRef.current.dishes.find((d) => d.id === dishId);

  const changeName = (dishId: string, name: string) => {
    updateDishes((dishes) =>
      dishes.map((d) => (d.id === dishId ? { ...d, name, complete: d.complete && name.trim() !== "" } : d)),
    );
    schedule(
      `name:${dishId}`,
      () => renameDish(event.venueId, event.id, dishId, latestDish(dishId)?.name ?? ""),
      NAME_SAVE_DELAY_MS,
    );
  };

  /** Cycles a cell as in the prototype: none → contains → may contain → none. */
  const cycleAllergen = (dishId: string, allergen: AllergenId) => {
    updateDishes((dishes) =>
      dishes.map((d) => {
        if (d.id !== dishId) return d;
        const allergens = { ...d.allergens };
        const next = NEXT_MARK[allergens[allergen] ?? "none"];
        if (next === "none") delete allergens[allergen];
        else allergens[allergen] = next;
        return { ...d, allergens };
      }),
    );
    schedule(
      `allergen:${dishId}:${allergen}`,
      () => setAllergen(event.venueId, event.id, dishId, allergen, latestDish(dishId)?.allergens[allergen] ?? null),
      ALLERGEN_SAVE_DELAY_MS,
    );
  };

  /** Closes the note editor and puts focus back on the cell it was opened from. */
  const closeNote = () => {
    if (!noteEditing) return;
    const selector = cellSelector(noteEditing.dishId, noteEditing.allergen);
    setNoteEditing(null);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus());
  };

  const saveNote = (dishId: string, allergen: AllergenId, text: string) => {
    const note = text.replace(/\s+/g, " ").trim();
    updateDishes((dishes) =>
      dishes.map((d) => {
        if (d.id !== dishId) return d;
        const notes = { ...d.notes };
        if (note) notes[allergen] = note;
        else delete notes[allergen];
        return { ...d, notes };
      }),
    );
    closeNote();
    // Saved straight away, before the re-render, so send the note itself rather than reading state.
    runSave(() => setNote(event.venueId, event.id, dishId, allergen, note));
  };

  /** Replaces the dish list with another standard menu's, once the server has saved it. */
  const switchMenu = async (menu: StandardMenu) => {
    // Waiting saves are for dishes that are about to be replaced.
    for (const entry of scheduled.current.values()) clearTimeout(entry.timer);
    scheduled.current.clear();
    setNoteEditing(null);
    setRemoving(null);
    setMenuPending(true);
    await runSave(async () => {
      const result = await changeMenu(event.venueId, event.id, menu.id);
      if (result.ok) {
        const { menuId, menuName, dishes } = result;
        setEvent((current) => ({ ...current, menuId, menuName, dishes }));
      }
      return result;
    });
    setMenuPending(false);
    setChangingMenu(false);
  };

  const toggleComplete = (dishId: string, complete: boolean) => {
    updateDishes((dishes) => dishes.map((d) => (d.id === dishId ? { ...d, complete } : d)));
    // Saved straight away, so send the value rather than reading state that hasn't re-rendered yet.
    runSave(() => setComplete(event.venueId, event.id, dishId, complete));
  };

  const toggleTag = (dishId: string, tag: DietaryTag) => {
    updateDishes((dishes) =>
      dishes.map((d) =>
        d.id !== dishId ? d : { ...d, tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag] },
      ),
    );
    schedule(
      `tag:${dishId}:${tag}`,
      () => setTag(event.venueId, event.id, dishId, tag, latestDish(dishId)?.tags.includes(tag) ?? false),
      TAG_SAVE_DELAY_MS,
    );
  };

  const add = () => {
    const id = `d-${crypto.randomUUID().slice(0, 8)}`;
    updateDishes((dishes) => [
      ...dishes,
      {
        id,
        name: "",
        section: event.menuId ? "Other" : "Dish",
        allergens: {},
        tags: [],
        mayContain: "",
        notes: {},
        complete: false,
      },
    ]);
    focusAfterRender.current = `[data-dish-name="${id}"]`;
    runSave(() => addDish(event.venueId, event.id, id));
  };

  const remove = (dishId: string) => {
    const index = event.dishes.findIndex((d) => d.id === dishId);
    const next = event.dishes[index + 1] ?? event.dishes[index - 1];
    // Drop the dish's waiting saves; they'd fail once it's gone.
    for (const [key, entry] of scheduled.current) {
      if (key.split(":")[1] === dishId) {
        clearTimeout(entry.timer);
        scheduled.current.delete(key);
      }
    }
    setRemoving(null);
    if (noteEditing?.dishId === dishId) setNoteEditing(null);
    updateDishes((dishes) => dishes.filter((d) => d.id !== dishId));
    focusAfterRender.current = next ? `[data-dish-name="${next.id}"]` : null;
    runSave(() => removeDish(event.venueId, event.id, dishId));
  };

  const removingDish = event.dishes.find((d) => d.id === removing);
  // As in the prototype, only standard-menu events (EMCC) can switch menu.
  const canSwitchMenu = event.menuId !== null && usesStandardMenus(event.venueId);
  const done = dishesDone(event);
  const total = event.dishes.length;
  const unnamed = event.dishes.filter((d) => !d.name.trim()).length;
  const blocked = printBlockedReason(event);
  const dashboardHref = `/venues/${event.venueId}/dashboard`;
  const printHref = `/venues/${event.venueId}/events/${event.id}/print`;

  const printButton = (label: string, id: string, tour?: string) =>
    blocked ? (
      <Button variant="gold" disabled aria-describedby={id} data-tour={tour}>
        {label}
      </Button>
    ) : (
      <Link href={printHref} prefetch={false} className="btn btn-gold" data-tour={tour}>
        {label}
      </Link>
    );

  return (
    <>
      <div className={styles.screen}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <Link href={dashboardHref} className={styles.back}>
              ‹ Back to dashboard
            </Link>
            <h1 className={styles.title}>{event.name}</h1>
            <p className={styles.meta}>
              {eventDateLabel(event)} · {event.room} · {event.time} · {event.guests} guests · {menuLabel(event)}
              {canSwitchMenu && (
                <>
                  {" · "}
                  <button type="button" className={styles.changeMenu} onClick={() => setChangingMenu(true)}>
                    Change menu
                  </button>
                </>
              )}
            </p>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.version}>
              v{event.version} · edited {event.lastModifiedAt}
            </span>
            {printButton("Preview & print", "print-blocked-head", "entry-print")}
          </div>
        </div>
        {blocked && (
          <p id="print-blocked-head" className="sr-only">
            {blocked}
          </p>
        )}

        <div className={styles.progress}>
          <ProgressBar value={done} max={total} label={`${done} of ${total} ${total === 1 ? "dish" : "dishes"} completed`} />
        </div>

        {blocked && (
          <div className={`banner banner-info ${styles.banner}`}>
            <div className="banner-body">
              {[
                done < total &&
                  `${total - done} ${total - done === 1 ? "dish still needs" : "dishes still need"} allergen entry.`,
                unnamed > 0 &&
                  `${unnamed} ${unnamed === 1 ? "dish has" : "dishes have"} no name — every dish must be named before printing.`,
              ]
                .filter(Boolean)
                .join(" ")}
            </div>
          </div>
        )}

        <ol className={styles.dishes} aria-label="Dishes">
          {event.dishes.map((dish, i) => {
            const status = dishStatus(dish);
            const onlyDish = total <= 1;
            const label = dish.name.trim() || `Dish ${i + 1}`;
            // Only completing is blocked; a complete dish can always go back to in progress.
            const completeBlocked = dish.complete ? null : completeBlockedReason(dish, conflictingTags(dish));
            return (
              <li key={dish.id} className={`${styles.dish} ${styles[status]}`}>
                <div className={styles.dishHead}>
                  <span className={styles.index} aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className={styles.dishTitle}>
                    {/* A textarea so long names wrap instead of being cut off; Enter finishes editing. */}
                    <textarea
                      className={styles.dishName}
                      value={dish.name}
                      rows={1}
                      onChange={(e) => changeName(dish.id, e.target.value.replace(/\s*\n\s*/g, " "))}
                      onBlur={() => flush(`name:${dish.id}`)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        e.currentTarget.blur();
                      }}
                      placeholder="Untitled dish"
                      maxLength={MAX_DISH_NAME}
                      aria-label={`Dish ${i + 1} name`}
                      data-dish-name={dish.id}
                      autoComplete="off"
                    />
                    <span className={styles.section}>{dish.section}</span>
                  </div>
                  <DietaryTags
                    venueId={event.venueId}
                    dish={dish}
                    dishLabel={dish.name.trim() || `Dish ${i + 1}`}
                    onToggle={(tag) => toggleTag(dish.id, tag)}
                  />
                  <span className={`badge ${DISH_STATUS[status].className}`}>
                    <span className="badge-dot" aria-hidden="true" />
                    {DISH_STATUS[status].label}
                  </span>
                  <Button
                    variant="secondary"
                    className={`btn-sm ${styles.remove}`}
                    // aria-disabled rather than disabled, so the reason can still be focused and heard.
                    aria-disabled={onlyDish || undefined}
                    aria-describedby={onlyDish ? "last-dish-reason" : undefined}
                    title={onlyDish ? "An event must keep at least one dish" : undefined}
                    aria-label={`Remove ${label}`}
                    onClick={() => !onlyDish && setRemoving(dish.id)}
                  >
                    Remove
                  </Button>
                </div>
                <AllergenGrid
                  dish={dish}
                  dishLabel={dish.name.trim() || `Dish ${i + 1}`}
                  onCycle={(allergen) => cycleAllergen(dish.id, allergen)}
                  onEditNote={(allergen) => setNoteEditing({ dishId: dish.id, allergen })}
                  tour={i === 0}
                />
                {noteEditing?.dishId === dish.id && (
                  <NoteEditor
                    key={noteEditing.allergen}
                    allergenLabel={allergenLabel(noteEditing.allergen)}
                    initial={dish.notes[noteEditing.allergen] ?? ""}
                    onSave={(text) => saveNote(dish.id, noteEditing.allergen, text)}
                    onCancel={closeNote}
                  />
                )}
                <p className={styles.gridHint}>
                  Click a cell to cycle: none → contains (✕) → may contain (M) → none · the pencil (or N on a
                  cell) adds an ingredient note
                </p>
                <TagConflicts venueId={event.venueId} dish={dish} />
                <div className={styles.dishFoot}>
                  {completeBlocked && (
                    <p id={`complete-reason-${dish.id}`} className={styles.completeReason}>
                      {completeBlocked}
                    </p>
                  )}
                  <Button
                    variant={dish.complete ? "secondary" : "primary"}
                    className={`btn-sm ${styles.completeButton}`}
                    aria-disabled={completeBlocked ? true : undefined}
                    aria-describedby={completeBlocked ? `complete-reason-${dish.id}` : undefined}
                    aria-label={`${dish.complete ? "Mark in progress" : "Mark complete"}: ${label}`}
                    data-tour={i === 0 ? "mark-complete" : undefined}
                    onClick={() => !completeBlocked && toggleComplete(dish.id, !dish.complete)}
                  >
                    {dish.complete ? "Mark in progress" : "Mark dish complete"}
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>

        <button
          type="button"
          className={styles.addDish}
          onClick={add}
          disabled={total >= MAX_DISHES}
          aria-describedby={total >= MAX_DISHES ? "add-dish-limit" : undefined}
        >
          + Add dish
        </button>
        {total >= MAX_DISHES && (
          <p id="add-dish-limit" className={styles.gridHint}>
            An event can hold at most {MAX_DISHES} dishes.
          </p>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerStart}>
          <Link href={dashboardHref} className={`btn btn-ghost ${styles.footerBack}`}>
            ‹ Back to dashboard
          </Link>
          <span className={styles.footerMeta}>
            {done} of {total} {total === 1 ? "dish" : "dishes"} done · last edited {event.lastModifiedAt} · changes
            save automatically
          </span>
          <SaveStatus state={save.state} savedAt={save.savedAt} onRetry={retry} />
          {save.state === "error" && save.message && <span className={styles.saveError}>{save.message}</span>}
        </div>
        {printButton("Preview & print all 3", "print-blocked-head")}
      </div>

      {total <= 1 && (
        <p id="last-dish-reason" className="sr-only">
          An event must keep at least one dish.
        </p>
      )}
      {changingMenu && event.menuId && (
        <ChangeMenuDialog
          event={event}
          menus={menus}
          initialMenuId={event.menuId}
          pickMenu
          pending={menuPending}
          onCancel={() => !menuPending && setChangingMenu(false)}
          onConfirm={switchMenu}
        />
      )}
      {removingDish && (
        <RemoveDishDialog
          dish={removingDish}
          fallbackName={`Dish ${event.dishes.indexOf(removingDish) + 1}`}
          lastPrintedAt={event.lastPrintedAt}
          onCancel={() => setRemoving(null)}
          onConfirm={() => remove(removingDish.id)}
        />
      )}
    </>
  );
}
