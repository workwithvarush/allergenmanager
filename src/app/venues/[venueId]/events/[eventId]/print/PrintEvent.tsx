"use client";

import { createContext, use, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { SaveStatus, type SaveState } from "@/components/SaveStatus";
import { formatDayShort } from "@/lib/dates";
import { MAX_MESSAGE } from "@/lib/events";
import { venueDate, venueTime } from "@/lib/venue-time";
import { recordPrint, setMessage, type SaveResult } from "../actions";
import styles from "./PrintPage.module.css";

/** Typing pauses this long before the message is saved. */
const MESSAGE_SAVE_DELAY_MS = 800;

type PrintEventState = {
  message: string;
  changeMessage: (text: string) => void;
  /** Sends the message now if a save is waiting (e.g. on leaving the box). */
  flushMessage: () => void;
  version: number;
  lastModifiedAt: string;
  save: { state: SaveState; savedAt?: Date; error?: string };
  retry: () => void;
  /** Stamped on every printed page: "v6 · 15 Oct · 11:48" when printed, "v6 · preview" before. */
  pageStamp: string;
  /** Opens the browser's print dialog for all 3 documents, then records the print. */
  print: () => Promise<void>;
  printing: boolean;
  /** Set after a recorded print, for the "Printed" dialog. */
  printed: { stamp: string } | null;
  dismissPrinted: () => void;
  printError: string | null;
};

const PrintEventContext = createContext<PrintEventState | null>(null);

function usePrintEvent(): PrintEventState {
  const value = use(PrintEventContext);
  if (!value) throw new Error("Print event components must sit inside <PrintEventProvider>.");
  return value;
}

type PrintEventProviderProps = {
  venueId: string;
  eventId: string;
  initialMessage: string;
  initialVersion: number;
  initialLastModifiedAt: string;
  children: ReactNode;
};

/**
 * The parts of the print page that change while it's open: the additional
 * message (edited above the sheet, shown live on it) and the version stamp.
 */
export function PrintEventProvider({
  venueId,
  eventId,
  initialMessage,
  initialVersion,
  initialLastModifiedAt,
  children,
}: PrintEventProviderProps) {
  const [message, setMessageText] = useState(initialMessage);
  const [stamp, setStamp] = useState({ version: initialVersion, lastModifiedAt: initialLastModifiedAt });
  const [save, setSave] = useState<PrintEventState["save"]>({ state: "idle" });
  const latest = useRef(initialMessage);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionRef = useRef(initialVersion);
  const [printStamp, setPrintStamp] = useState<{ version: number; text: string } | null>(null);
  const [printing, setPrinting] = useState(false);
  const [printed, setPrinted] = useState<{ stamp: string } | null>(null);
  const [printError, setPrintError] = useState<string | null>(null);

  const send = async () => {
    setSave({ state: "saving" });
    let result: SaveResult;
    try {
      result = await setMessage(venueId, eventId, latest.current);
    } catch {
      result = { ok: false, message: "The server could not be reached." };
    }
    if (result.ok) {
      versionRef.current = result.version;
      setStamp({ version: result.version, lastModifiedAt: result.lastModifiedAt });
      setSave({ state: "saved", savedAt: new Date() });
    } else {
      setSave({ state: "error", error: result.message });
    }
  };

  const flushMessage = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
    void send();
  };

  const changeMessage = (text: string) => {
    latest.current = text;
    setMessageText(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flushMessage, MESSAGE_SAVE_DELAY_MS);
  };

  const print = async () => {
    if (printing) return;
    setPrinting(true);
    setPrintError(null);
    // A message still waiting to save goes first, so the pages and the record share one version.
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      await send();
    }
    const version = versionRef.current;
    const text = `v${version} · ${formatDayShort(venueDate(new Date()))} · ${venueTime(new Date())}`;
    // Stamp the pages before the browser lays them out for printing.
    flushSync(() => setPrintStamp({ version, text }));
    window.print();
    try {
      const result = await recordPrint(venueId, eventId, version);
      if (result.ok) setPrinted({ stamp: text });
      else setPrintError(result.message);
    } catch {
      setPrintError("The print couldn't be recorded — the server could not be reached. Print again once the connection returns.");
    }
    setPrinting(false);
  };

  // Leaving the page sends a message that is still waiting, and warns if it can't.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timer.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      flushMessage();
    };
    // flushMessage only touches refs and state setters, so the first render's copy is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PrintEventContext
      value={{
        message,
        changeMessage,
        flushMessage,
        ...stamp,
        save,
        retry: () => void send(),
        // A print stamp only stands while nothing has changed since.
        pageStamp: printStamp?.version === stamp.version ? printStamp.text : `v${stamp.version} · preview`,
        print,
        printing,
        printed,
        dismissPrinted: () => setPrinted(null),
        printError,
      }}
    >
      {children}
    </PrintEventContext>
  );
}

/** Print state for the button, dialog and page stamps. */
export function usePrinting() {
  const { pageStamp, print, printing, printed, dismissPrinted, printError } = usePrintEvent();
  return { pageStamp, print, printing, printed, dismissPrinted, printError };
}

/** The additional message as currently typed (for laying out the sheet). */
export function usePrintMessage(): string {
  return usePrintEvent().message;
}

/** "v6 · edited 11:42" — updates when the message is saved. */
export function VersionStamp({ className }: { className?: string }) {
  const { version, lastModifiedAt } = usePrintEvent();
  return (
    <span className={className}>
      v{version} · edited {lastModifiedAt}
    </span>
  );
}

/** The editor for the additional message, shown above the sheet preview (prototype: "Additional message"). */
export function MessageEditor() {
  const { message, changeMessage, flushMessage, save, retry } = usePrintEvent();
  const id = useId();
  const remaining = MAX_MESSAGE - message.length;

  return (
    <div className={styles.messageCard}>
      <div className={styles.messageHead}>
        <label htmlFor={id} className={styles.messageLabel}>
          Additional message
        </label>
        <span id={`${id}-hint`} className={styles.messageHint}>
          Prints in a box below the allergen sheet
        </span>
      </div>
      <textarea
        id={id}
        className={`input ${styles.messageInput}`}
        value={message}
        onChange={(e) => changeMessage(e.target.value)}
        onBlur={flushMessage}
        placeholder="e.g. Nut-free section of the kitchen in use for this service"
        maxLength={MAX_MESSAGE}
        rows={3}
        aria-describedby={`${id}-hint ${id}-count`}
      />
      <div className={styles.messageFoot}>
        <SaveStatus state={save.state} savedAt={save.savedAt} onRetry={retry} />
        {save.state === "error" && save.error && <span className={styles.messageError}>{save.error}</span>}
        <span id={`${id}-count`} className={styles.messageCount}>
          {remaining < 60 ? `${remaining} characters left` : ""}
        </span>
      </div>
    </div>
  );
}

/** The message as printed on the sheet; nothing when empty. */
export function SheetMessage({ className }: { className?: string }) {
  const { message } = usePrintEvent();
  if (!message.trim()) return null;
  return <p className={className}>{message.trim()}</p>;
}
