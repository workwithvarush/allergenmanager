"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { dishesWithEntries, menuLabel, type AllergenEvent } from "@/lib/events";
import type { StandardMenu } from "@/lib/menus";
import styles from "./ChangeMenuDialog.module.css";

type ChangeMenuDialogProps = {
  event: Pick<AllergenEvent, "name" | "menuId" | "menuName" | "dishes" | "lastPrintedAt">;
  /** The venue's menus that can be switched to (not retired). */
  menus: readonly StandardMenu[];
  /** The menu to switch to; with `pickMenu`, the one selected when the dialog opens. */
  initialMenuId: string;
  /** Show the standard menus to choose from (allergen entry), not just a confirmation (dashboard). */
  pickMenu?: boolean;
  /** Disables the buttons while the change is saving. */
  pending?: boolean;
  onCancel: () => void;
  onConfirm: (menu: StandardMenu) => void;
};

/**
 * Switching menu replaces the dish list, so every allergen mark, tag, note and
 * completed dish is lost. As in the prototype, this says how much entry will be
 * discarded before anything changes; it also flags when printed sheets will go out of date.
 */
export function ChangeMenuDialog({
  event,
  menus,
  initialMenuId,
  pickMenu = false,
  pending = false,
  onCancel,
  onConfirm,
}: ChangeMenuDialogProps) {
  const [menuId, setMenuId] = useState(initialMenuId);
  const target = menus.find((m) => m.id === menuId);
  // The name the event took the menu on with (it may have been renamed or retired since).
  const current = event.menuId ? { name: menuLabel(event) } : undefined;
  const changing = target !== undefined && target.id !== event.menuId;
  const entered = dishesWithEntries(event);
  const completed = event.dishes.filter((d) => d.complete).length;

  return (
    <Dialog
      open
      onClose={onCancel}
      size={pickMenu ? "md" : "sm"}
      eyebrow={pickMenu ? event.name : undefined}
      title={pickMenu ? "Change menu" : `Switch ${event.name} to ${target?.name}?`}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={pending} data-autofocus>
            Keep current menu
          </Button>
          <Button
            variant={entered > 0 ? "danger" : "primary"}
            disabled={!changing || pending}
            onClick={() => target && onConfirm(target)}
          >
            {pending ? "Switching…" : entered > 0 ? "Replace dish list" : "Switch menu"}
          </Button>
        </>
      }
    >
      {pickMenu && (
        <fieldset className={styles.menus}>
          <legend className="sr-only">Menu</legend>
          {menus.map((menu) => (
            <label key={menu.id} className={styles.menu}>
              <input
                type="radio"
                name="menu"
                value={menu.id}
                checked={menu.id === menuId}
                onChange={() => setMenuId(menu.id)}
                className="sr-only"
              />
              <span className={styles.menuName}>{menu.name}</span>
              <span className={styles.menuMeta}>
                {menu.dishes.length} dishes{menu.id === event.menuId ? " · current" : ""}
              </span>
            </label>
          ))}
        </fieldset>
      )}

      {changing ? (
        <>
          <p className={styles.body}>
            The current dish list{current ? ` (${current.name}, ${event.dishes.length} dishes)` : ""} will be replaced
            with the {target.name} dish list ({target.dishes.length} dishes). Every dish starts blank.
          </p>
          {entered > 0 && (
            <div className="banner banner-warn">
              <div className="banner-body">
                {entered} {entered === 1 ? "dish already has" : "dishes already have"} allergen entry
                {completed > 0 ? `, ${completed} marked complete` : ""}. That work will be discarded and cannot be
                recovered.
              </div>
            </div>
          )}
          {event.lastPrintedAt && (
            <div className="banner banner-warn">
              <div className="banner-body">
                This event was printed at {event.lastPrintedAt}. The printed sheets will be out of date and will need a
                reprint once the new dishes are complete.
              </div>
            </div>
          )}
        </>
      ) : (
        pickMenu && <p className={styles.body}>{current?.name ?? "This menu"} is the current menu. Choose another to switch.</p>
      )}
    </Dialog>
  );
}
