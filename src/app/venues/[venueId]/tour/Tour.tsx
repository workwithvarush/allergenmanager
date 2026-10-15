"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { TOUR_STEPS, type TourScreen, type TourStep } from "./steps";
import styles from "./Tour.module.css";

type TourProps = {
  venueId: string;
  /** Event used for the entry and print steps (one ready to print if possible); null skips those steps. */
  eventId: string | null;
  canCreate: boolean;
  canArchive: boolean;
};

type Rect = { top: number; left: number; width: number; height: number };

const CARD_WIDTH = 320;
const GAP = 14;
/** How long to wait for a step's element to appear (e.g. while its page loads). */
const FIND_TIMEOUT_MS = 5000;

/**
 * The prototype's "?" help button and guided tour. Each step goes to its page,
 * highlights one element with a spotlight and explains it in a card. Back/Next
 * (or ←/→), Esc or ✕ closes; clicking outside the card closes too.
 */
export function Tour({ venueId, eventId, canCreate, canArchive }: TourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardHeight, setCardHeight] = useState(230);
  const helpRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const bodyId = useId();

  const steps = TOUR_STEPS.filter(
    (s) =>
      (s.need !== "create" || canCreate) &&
      (s.need !== "archive" || canArchive) &&
      (eventId !== null || (s.screen !== "entry" && s.screen !== "print")),
  );
  const step: TourStep | undefined = open ? steps[Math.min(index, steps.length - 1)] : undefined;

  const hrefFor = (screen: TourScreen) => {
    const base = `/venues/${venueId}`;
    if (screen === "entry") return `${base}/events/${eventId}`;
    if (screen === "print") return `${base}/events/${eventId}/print`;
    return `${base}/${screen}`;
  };

  // Go to the step's page if needed, then follow its element (it may move as the page loads or scrolls).
  useEffect(() => {
    if (!step) return;
    const href = hrefFor(step.screen);
    if (pathname !== href) router.push(href);
    let frame = 0;
    let scrolled = false;
    let started: number | null = null;
    const follow = (time: number) => {
      started ??= time;
      // Visited pages stay mounted but hidden, so only a visible element counts.
      const element = [...document.querySelectorAll<HTMLElement>(`[data-tour="${step.target}"]`)].find(
        (el) => el.getClientRects().length > 0,
      );
      if (element) {
        if (!scrolled) {
          scrolled = true;
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          element.scrollIntoView({ block: "center", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
        }
        const r = element.getBoundingClientRect();
        setRect((prev) =>
          prev && Math.abs(prev.top - r.top) < 0.5 && Math.abs(prev.left - r.left) < 0.5 && Math.abs(prev.width - r.width) < 0.5 && Math.abs(prev.height - r.height) < 0.5
            ? prev
            : { top: r.top, left: r.left, width: r.width, height: r.height },
        );
      } else if (time - started > FIND_TIMEOUT_MS) {
        setRect(null); // Not on this page (e.g. no events): show the card on its own.
      }
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
    // hrefFor only depends on props; re-run per step and when the page changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pathname]);

  // Focus the card's main button on each step; keep the card's real height for placing it.
  useLayoutEffect(() => {
    if (!step) return;
    nextRef.current?.focus({ preventScroll: true });
    if (cardRef.current) setCardHeight(cardRef.current.offsetHeight);
  }, [step]);

  const close = () => {
    setOpen(false);
    setRect(null);
    helpRef.current?.focus();
  };
  const go = (i: number) => {
    setRect(null);
    setIndex(i);
  };
  const next = () => (index >= steps.length - 1 ? close() : go(index + 1));
  const back = () => index > 0 && go(index - 1);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      back();
    } else if (e.key === "Tab") {
      // Keep focus in the card while the tour is open.
      const buttons = [...(cardRef.current?.querySelectorAll<HTMLButtonElement>("button:not([disabled])") ?? [])];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  // Card placement, as in the prototype: beside, below or above the highlight, kept on screen.
  const cardPosition = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(CARD_WIDTH, vw - 32);
    const clampLeft = (left: number) => Math.min(Math.max(16, left), vw - width - 16);
    if (!rect) return { top: Math.max(20, vh / 2 - cardHeight / 2), left: clampLeft(vw / 2 - width / 2), width };
    if (step?.place === "right" && rect.left + rect.width + GAP + width < vw - 12) {
      return { top: Math.min(Math.max(16, rect.top), vh - cardHeight - 16), left: rect.left + rect.width + GAP, width };
    }
    if (step?.place === "above" || rect.top + rect.height + GAP + cardHeight > vh - 12) {
      return { top: Math.max(16, rect.top - cardHeight - GAP), left: clampLeft(rect.left), width };
    }
    return { top: rect.top + rect.height + GAP, left: clampLeft(rect.left), width };
  };

  return (
    <>
      <button
        ref={helpRef}
        type="button"
        className={styles.help}
        data-tour="help"
        aria-label="Tutorial"
        title="Tutorial"
        onClick={() => {
          setIndex(0);
          setRect(null);
          setOpen(true);
        }}
      >
        ?
      </button>

      {step && (
        <div className={styles.layer}>
          {/* Clicking anywhere outside the card closes the tour, as in the prototype. */}
          <div className={styles.backdrop} onClick={close} aria-hidden="true" />
          {rect ? (
            <div
              className={styles.spotlight}
              style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
              aria-hidden="true"
            />
          ) : (
            <div className={styles.dim} aria-hidden="true" />
          )}
          <div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={bodyId}
            className={styles.card}
            style={cardPosition()}
            onKeyDown={onKeyDown}
          >
            <div className={styles.cardHead}>
              <span className={styles.stepLabel}>
                Step {index + 1} of {steps.length}
              </span>
              <button type="button" className={styles.close} aria-label="Close tutorial" onClick={close}>
                ✕
              </button>
            </div>
            <div className={styles.cardBody}>
              <h2 id={titleId} className={styles.title}>
                {step.title}
              </h2>
              <p id={bodyId} className={styles.body}>
                {step.body}
              </p>
              {step.points.length > 0 && (
                <ul className={styles.points}>
                  {step.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className={styles.cardFoot}>
              <span className={styles.dots} aria-hidden="true">
                {steps.map((s, k) => (
                  <span key={s.target} className={k === index ? styles.dotActive : styles.dot} />
                ))}
              </span>
              <span className={styles.actions}>
                <button type="button" className={styles.back} onClick={back} disabled={index === 0}>
                  Back
                </button>
                <button ref={nextRef} type="button" className={styles.next} onClick={next}>
                  {index === steps.length - 1 ? "Done" : "Next"}
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
