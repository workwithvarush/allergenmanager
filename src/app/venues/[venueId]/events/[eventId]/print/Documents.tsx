"use client";

import { Playfair_Display } from "next/font/google";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import allergenLeaf from "@/assets/print/allergen-leaf.png";
import menuFooterLeaf from "@/assets/print/menu-footer-leaf.png";
import venuesHeader from "@/assets/print/nottingham-venues-header.png";
import { AllergenIcon } from "@/components/AllergenIcon";
import { ALLERGENS } from "@/lib/allergens";
import { DIETARY_TAGS, venueTags } from "@/lib/dietary-tags";
import type { AllergenEvent, Dish } from "@/lib/events";
import {
  containsText,
  mayContainText,
  menuPages,
  paginate,
  PLACECARDS_PER_PAGE,
  printStyle,
  SHEET_TIERS,
  sheetTierIndex,
  tagsText,
} from "@/lib/print";
import styles from "./Documents.module.css";
import { SheetMessage, usePrinting, usePrintMessage } from "./PrintEvent";

/** Serif for the formal (EMCC) titles, as in the prototype. */
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair" });

type DocumentProps = { event: AllergenEvent };

/** One A4 sheet at its real size; the preview scales the whole stack to fit. */
function Page({
  eventName,
  landscape = false,
  className,
  style,
  ref,
  children,
}: {
  /** Printed with the version stamp in the page's corner. */
  eventName: string;
  landscape?: boolean;
  className?: string;
  /** On the content box, e.g. a size variable the document fits itself with. */
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  const { pageStamp } = usePrinting();
  return (
    <section className={[styles.page, landscape ? styles.landscape : styles.portrait, playfair.variable].join(" ")}>
      {/* The page's content box: turned a quarter for printing when landscape (see the print CSS).
          data-fit: the preview warns if anything overflows it. */}
      <div ref={ref} className={`${styles.pageInner} ${className ?? ""}`} style={style} data-fit>
        {children}
        {/* The version stamp: lets counters check at a glance that a sheet is current. */}
        <p className={styles.stamp}>
          {eventName} · {pageStamp}
        </p>
      </div>
    </section>
  );
}

/**
 * False until the web fonts have loaded. Text measured in a fallback font
 * wraps differently, so documents fit themselves again once this turns true.
 */
function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    document.fonts.ready.then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);
  return ready;
}

/** "(V) = Vegetarian   (VG) = Vegan …" for the venue's tags. */
function tagLegend(event: AllergenEvent): string {
  return venueTags(event.venueId)
    .map((tag) => `(${DIETARY_TAGS[tag].label}) = ${DIETARY_TAGS[tag].name}`)
    .join("   ");
}

/** Icon size in the sheet header, by style and size tier (formal from the prototype). */
const ICON_SIZE = {
  formal: { large: 52, medium: 42, small: 32 },
  branded: { large: 26, medium: 20, small: 14 },
} as const;

const MARK: Record<"present" | "may", { formal: string; branded: string }> = {
  present: { formal: "X", branded: "✕" },
  may: { formal: "M", branded: "M" },
};

/**
 * Allergen sheet: one row per dish, one column per allergen, landscape A4.
 * A note prints in place of the mark. Formal style shows tags after each dish name.
 */
export function AllergenSheet({ event }: DocumentProps) {
  const style = printStyle(event.venueId);
  const formal = style === "formal";
  const message = usePrintMessage();

  // Start at the size for the dish count; shrink, then split pages, until nothing overflows A4.
  // Starts again whenever the content changes (e.g. the message is edited).
  const initial = () => {
    const tierIndex = sheetTierIndex(event.dishes.length);
    return { tierIndex, rowsPerPage: SHEET_TIERS[tierIndex].rowsPerPage as number };
  };
  const fontsReady = useFontsReady();
  const contentKey = `${event.version}|${message}|${fontsReady}`;
  const [fit, setFit] = useState(initial);
  const [fittedKey, setFittedKey] = useState(contentKey);
  if (fittedKey !== contentKey) {
    setFittedKey(contentKey);
    setFit(initial());
  }
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const check = () => {
      // Pages in a hidden tab have no size; they're checked when the tab is shown.
      const overflowing = pageRefs.current.some((p) => p && p.clientHeight > 0 && p.scrollHeight > p.clientHeight + 1);
      if (!overflowing) return;
      setFit((f) => {
        if (f.tierIndex < SHEET_TIERS.length - 1) {
          const tierIndex = f.tierIndex + 1;
          return { tierIndex, rowsPerPage: Math.min(f.rowsPerPage, SHEET_TIERS[tierIndex].rowsPerPage) };
        }
        return f.rowsPerPage > 1 ? { ...f, rowsPerPage: f.rowsPerPage - 1 } : f;
      });
    };
    check();
    const observer = new ResizeObserver(check);
    for (const p of pageRefs.current) if (p) observer.observe(p);
    return () => observer.disconnect();
  }, [fit, contentKey]);

  const { tier } = SHEET_TIERS[fit.tierIndex];
  const pages = paginate(event.dishes, fit.rowsPerPage);

  return pages.map((dishes, pageIndex) => (
    <Page
      key={pageIndex}
      ref={(el) => {
        pageRefs.current[pageIndex] = el;
      }}
      eventName={event.name}
      landscape
      className={`${styles.sheet} ${styles[style]} ${styles[tier]}`}
    >
      <header className={styles.sheetHeader}>
        {formal && <Image src={allergenLeaf} alt="" className={styles.sheetLeaf} loading="eager" />}
        <h2 className={styles.sheetTitle}>{formal ? "Allergen List: Today's Menu" : "Nottingham Venues"}</h2>
        {pages.length > 1 && (
          <p className={styles.pageNumber}>
            Page {pageIndex + 1} of {pages.length}
          </p>
        )}
      </header>
      <table className={styles.matrix}>
        <thead>
          <tr>
            <th className={styles.dishHead} scope="col">
              {formal ? "DISH" : "Dish"}
            </th>
            {ALLERGENS.map((a) => (
              <th key={a.id} scope="col" className={styles.allergenHead}>
                <AllergenIcon allergen={a.id} size={ICON_SIZE[style][tier]} alt="" className={styles.headIcon} />
                <span>{a.label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dishes.map((dish) => (
            <tr key={dish.id}>
              <th scope="row" className={styles.dishCell}>
                {dish.name}
                {formal && dish.tags.length > 0 && <span className={styles.tags}> {tagsText(dish.tags)}</span>}
              </th>
              {ALLERGENS.map((a) => {
                const mark = dish.allergens[a.id];
                const note = dish.notes[a.id];
                return (
                  <td
                    key={a.id}
                    className={[styles.cell, note ? styles.noteCell : mark ? styles[mark] : ""].join(" ")}
                    title={note ? `${dish.name} · ${a.label}: ${note}` : undefined}
                  >
                    {note ?? (mark ? MARK[mark][style] : "")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {pageIndex === pages.length - 1 && <SheetMessage className={styles.sheetMessage} />}
      {pageIndex === pages.length - 1 &&
        (formal ? (
          <footer className={styles.formalLegend}>
            <p className={styles.tagLegend}>{tagLegend(event)}</p>
            <p>X = Contains indicated allergen / M = May Contain traces of indicated allergen (presence cannot be excluded)</p>
          </footer>
        ) : (
          <footer className={styles.brandedLegend}>
            <span>
              <b className={styles.legendPresent}>✕</b> Allergen present
            </span>
            <span>
              <b className={styles.legendMay}>M</b> Cross-contamination possible
            </span>
            <span>Empty cell — Absent</span>
          </footer>
        ))}
    </Page>
  ));
}

/**
 * Menu text sizes, largest first, as multiples of the base sizes in the CSS
 * (dish names 18px). A short menu prints large; a long one steps down until it
 * fits one page, with EMCC's artwork shrinking too. 0.66 (dish names about
 * 12px, 9pt) is the smallest before the menu continues on another page.
 */
const MENU_SCALES = [1.6, 1.45, 1.32, 1.2, 1.1, 1, 0.93, 0.86, 0.8, 0.74, 0.7, 0.66] as const;

/**
 * The section of dishes on a menu built dish by dish (Bramleys). It isn't a
 * course, so the menu doesn't print it as a heading (the prototype did).
 */
const UNSECTIONED = "Dish";

const DISCLAIMER =
  'We can offer accurate information on ingredients, however, due to the open plan nature of our kitchens, we are unable to guarantee that dishes are "free from" allergens. If you have any dietary requirements, please check the allergen sheet on display or inform the staff.';

/**
 * Guest menu: dish names by section with dietary tags, portrait A4. The text
 * sizes itself so the whole menu fits on one page. Only a menu too long for
 * that at the smallest size continues on further pages, each with the legend
 * and disclaimer, as pages may be displayed apart (e.g. at buffet stations).
 */
export function MenuDocument({ event }: DocumentProps) {
  const style = printStyle(event.venueId);
  const formal = style === "formal";

  // Fit the whole menu on one page: start at the largest size and step down while it overflows.
  // Only below the smallest size does a page's last dish move to a further page.
  // Starts again whenever the dishes change.
  const fontsReady = useFontsReady();
  const contentKey = `${event.version}|${fontsReady}`;
  const [fit, setFit] = useState<{ step: number; breaks: number[] }>({ step: 0, breaks: [] });
  const [fittedKey, setFittedKey] = useState(contentKey);
  if (fittedKey !== contentKey) {
    setFittedKey(contentKey);
    setFit({ step: 0, breaks: [] });
  }
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dishCount = event.dishes.length;

  useLayoutEffect(() => {
    const check = () => {
      // Pages in a hidden tab have no size; they're checked when the tab is shown.
      const p = pageRefs.current.findIndex((el) => el && el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 1);
      if (p === -1) return;
      setFit((current) => {
        if (current.step < MENU_SCALES.length - 1) return { step: current.step + 1, breaks: [] };
        const start = current.breaks[p - 1] ?? 0;
        const end = current.breaks[p] ?? dishCount;
        // A single dish that doesn't fit stays put; the preview warns about it.
        if (end - start <= 1) return current;
        const breaks = [...current.breaks];
        breaks[p] = end - 1;
        return { ...current, breaks };
      });
    };
    check();
    const observer = new ResizeObserver(check);
    for (const el of pageRefs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [fit, contentKey, dishCount]);

  const pages = menuPages(event.dishes, fit.breaks);
  const scale = { "--menu-scale": MENU_SCALES[fit.step] } as CSSProperties;

  return pages.map((sections, pageIndex) => (
    <Page
      key={pageIndex}
      ref={(el) => {
        pageRefs.current[pageIndex] = el;
      }}
      eventName={event.name}
      className={`${styles.menu} ${styles[style]}`}
      style={scale}
    >
      {formal && pageIndex === 0 && (
        <Image src={venuesHeader} alt="Nottingham Venues" className={styles.menuBanner} loading="eager" />
      )}
      <header className={styles.menuHeader}>
        <h2 className={styles.menuTitle}>{formal ? "MENU" : "Nottingham Venues"}</h2>
        {pages.length > 1 && (
          <p className={styles.pageNumber}>
            Page {pageIndex + 1} of {pages.length}
          </p>
        )}
      </header>
      {sections.map((section, i) => (
        <div key={section.title} className={styles.menuSection}>
          {formal ? (
            i > 0 && (
              <div className={styles.menuDivider} aria-hidden="true">
                *******
              </div>
            )
          ) : (
            section.title !== UNSECTIONED && (
              <h3 className={styles.menuSectionTitle}>
                {section.title}
                {section.continued && " (continued)"}
              </h3>
            )
          )}
          {section.dishes.map((dish) => (
            <p key={dish.id} className={styles.menuDish}>
              <span className={styles.menuDishName}>{dish.name}</span>
              {dish.tags.length > 0 && <span className={styles.menuTags}>{tagsText(dish.tags)}</span>}
            </p>
          ))}
        </div>
      ))}
      {formal ? (
        <footer className={styles.menuFooter}>
          {/* The key sits inside the leaf band, directly above the disclaimer, so it stays with the footer. */}
          <div className={styles.disclaimer}>
            <Image src={menuFooterLeaf} alt="" className={styles.disclaimerLeaf} />
            <div className={styles.disclaimerText}>
              <p className={styles.tagLegend}>{tagLegend(event)}</p>
              <p>{DISCLAIMER}</p>
            </div>
          </div>
        </footer>
      ) : (
        <footer className={styles.brandedLegend}>
          {venueTags(event.venueId).map((tag) => (
            <span key={tag}>
              <b className={styles.tags}>({DIETARY_TAGS[tag].label})</b> {DIETARY_TAGS[tag].name}
            </span>
          ))}
        </footer>
      )}
    </Page>
  ));
}

/** One label per dish: name, tags (formal only), Contains and May contain. 14 labels per A4 sheet. */
export function Placecards({ event }: DocumentProps) {
  const formal = printStyle(event.venueId) === "formal";
  const fontsReady = useFontsReady();
  const pages = paginate(event.dishes, PLACECARDS_PER_PAGE);

  return pages.map((dishes, pageIndex) => (
    <Page key={pageIndex} eventName={event.name} className={styles.placecardPage}>
      <div className={styles.placecards}>
        {dishes.map((dish) => (
          <Placecard key={dish.id} dish={dish} showTags={formal} fontsReady={fontsReady} />
        ))}
        {/* Unused labels on the sheet, drawn faintly so the layout matches the label stock. */}
        {Array.from({ length: PLACECARDS_PER_PAGE - dishes.length }, (_, i) => (
          <div key={`blank-${i}`} className={styles.blankCard} aria-hidden="true" />
        ))}
      </div>
    </Page>
  ));
}

/**
 * Label text sizes. Every label prints at the standard 12px, as in the prototype;
 * only a label whose text wouldn't fit steps down, so nothing is cut off. 10px
 * (7.5pt) is the smallest kept readable at arm's length; below that the preview warns.
 */
const CARD_FONT_SIZES = [12, 11, 10] as const;

function Placecard({ dish, showTags, fontsReady }: { dish: Dish; showTags: boolean; fontsReady: boolean }) {
  const contains = containsText(dish);
  const may = mayContainText(dish);

  // Start at full size whenever the text changes; step down while it overflows.
  const contentKey = `${dish.name}|${showTags ? tagsText(dish.tags) : ""}|${contains}|${may}|${fontsReady}`;
  const [step, setStep] = useState(0);
  const [fittedKey, setFittedKey] = useState(contentKey);
  if (fittedKey !== contentKey) {
    setFittedKey(contentKey);
    setStep(0);
  }
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const check = () => {
      // Labels in a hidden tab have no size; they're checked when the tab is shown.
      if (!el || el.clientHeight === 0) return;
      // Too tall, or a long word too wide for the label at this size.
      if (el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1) return;
      setStep((s) => Math.min(s + 1, CARD_FONT_SIZES.length - 1));
    };
    check();
    const observer = new ResizeObserver(check);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [step, contentKey]);

  return (
    // data-fit: the preview warns if a label's text still doesn't fit at the smallest size.
    <div
      ref={ref}
      className={styles.placecard}
      style={{ "--card-font": `${CARD_FONT_SIZES[step]}px` } as CSSProperties}
      data-fit
    >
      <p className={styles.cardName}>{dish.name}</p>
      {showTags && dish.tags.length > 0 && <p className={styles.cardTags}>{tagsText(dish.tags)}</p>}
      {contains && (
        <p className={styles.cardContains}>
          <strong>Contains:</strong> {contains}
        </p>
      )}
      {may && (
        <p className={styles.cardMay}>
          <strong>May contain:</strong> {may}
        </p>
      )}
    </div>
  );
}

