"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { DOCUMENTS, isDocumentId, type DocumentId } from "@/lib/print";
import styles from "./PrintPreview.module.css";

/** A4 width in CSS px (96 per inch), to scale each document against the available width. */
const A4_WIDTH_PX: Record<DocumentId, number> = {
  sheet: (297 / 25.4) * 96, // landscape
  menu: (210 / 25.4) * 96,
  placecards: (210 / 25.4) * 96,
};

type PrintPreviewProps = {
  /** Each document's pages, rendered on the server. */
  documents: Record<DocumentId, ReactNode>;
  /** Shown above the allergen sheet only, e.g. the additional message editor. */
  sheetTools?: ReactNode;
};

/**
 * Tabs for the three printed documents (`?doc=` keeps the choice on reload or
 * when shared). Each document is shown at A4 proportions, scaled to fit.
 */
export function PrintPreview({ documents, sheetTools }: PrintPreviewProps) {
  const searchParams = useSearchParams();
  const param = searchParams.get("doc");
  const active: DocumentId = isDocumentId(param) ? param : "sheet";
  const tabRefs = useRef(new Map<DocumentId, HTMLButtonElement>());
  const deskRef = useRef<HTMLDivElement>(null);
  const [deskWidth, setDeskWidth] = useState<number | null>(null);
  const [overflowing, setOverflowing] = useState(false);

  // Warn when anything in the shown document is cut off by its page or label edge,
  // so a clipped allergen line can't go to print unnoticed.
  useEffect(() => {
    const panel = document.getElementById(`panel-${active}`);
    if (!panel) return;
    const check = () => {
      const boxes = panel.querySelectorAll<HTMLElement>("[data-fit]");
      setOverflowing([...boxes].some((box) => box.clientHeight > 0 && box.scrollHeight > box.clientHeight + 1));
    };
    // Give the sheet's own fitting a frame to settle first.
    const frame = requestAnimationFrame(check);
    const observer = new MutationObserver(() => requestAnimationFrame(check));
    observer.observe(panel, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, deskWidth]);

  useEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;
    const observer = new ResizeObserver(([entry]) => setDeskWidth(entry.contentRect.width));
    observer.observe(desk);
    return () => observer.disconnect();
  }, []);

  const select = (doc: DocumentId, focus = false) => {
    window.history.replaceState(null, "", doc === "sheet" ? "?" : `?doc=${doc}`);
    if (focus) tabRefs.current.get(doc)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const index = DOCUMENTS.findIndex((d) => d.id === active);
    const next = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: DOCUMENTS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(DOCUMENTS[(next + DOCUMENTS.length) % DOCUMENTS.length].id, true);
  };

  return (
    <>
      <div className={styles.tabs} data-print-hide role="tablist" aria-label="Documents" onKeyDown={onKeyDown}>
        {DOCUMENTS.map((doc) => (
          <button
            key={doc.id}
            ref={(el) => {
              if (el) tabRefs.current.set(doc.id, el);
            }}
            type="button"
            role="tab"
            id={`tab-${doc.id}`}
            aria-selected={doc.id === active}
            aria-controls={`panel-${doc.id}`}
            tabIndex={doc.id === active ? 0 : -1}
            className={styles.tab}
            onClick={() => select(doc.id)}
          >
            {doc.label}
          </button>
        ))}
      </div>

      {/* Measures the available width; each panel's pages are scaled to it. */}
      <div ref={deskRef} className={styles.panels}>
        {DOCUMENTS.map((doc) => (
          <div
            key={doc.id}
            role="tabpanel"
            id={`panel-${doc.id}`}
            aria-labelledby={`tab-${doc.id}`}
            hidden={doc.id !== active}
            className={styles.panel}
          >
            {doc.id === "sheet" && <div data-print-hide>{sheetTools}</div>}
            {overflowing && doc.id === active && (
              <div className={`banner banner-danger ${styles.overflow}`} role="alert" data-print-hide>
                <div className="banner-body">
                  <div className="banner-title">Doesn&apos;t fit on the page</div>
                  Part of the {doc.label.toLowerCase()} would be cut off when printed.{" "}
                  {doc.id === "sheet"
                    ? "Long dish names, notes or the additional message need shortening."
                    : "Long dish names or notes need shortening."}
                </div>
              </div>
            )}
            <div className={styles.desk}>
              <div
                className={styles.pages}
                // Until the width is known, show at a safe small size rather than overflowing.
                style={{ zoom: deskWidth ? Math.min(1, (deskWidth - 48) / A4_WIDTH_PX[doc.id]) : 0.5 }}
              >
                {documents[doc.id]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
