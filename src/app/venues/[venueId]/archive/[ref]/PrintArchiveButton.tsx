"use client";

/**
 * "Download PDF": opens the browser's print dialog for the archive pages, where
 * "Save as PDF" produces the file — as in the prototype.
 */
export function PrintArchiveButton() {
  return (
    <button type="button" className="btn btn-gold btn-sm" onClick={() => window.print()}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        <path d="M7 11l5 5 5-5" />
        <path d="M12 4v12" />
      </svg>
      Download PDF
    </button>
  );
}
