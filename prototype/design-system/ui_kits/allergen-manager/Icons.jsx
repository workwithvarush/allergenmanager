/* global React */
// Inline SVG icon components. Tabler-style outline, 1.8px stroke, currentColor.
// Use as <Icon name="print" size={16} /> or <IconPrint size={16} />

const ICON_PATHS = {
  dashboard: <>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </>,
  edit: <>
    <path d="M4 20h4l10-10-4-4L4 16v4z" />
    <path d="M14 6l4 4" />
  </>,
  print: <>
    <path d="M6 9V4h12v5" />
    <rect x="3" y="9" width="18" height="8" rx="1" />
    <rect x="6" y="14" width="12" height="7" rx="1" />
  </>,
  search: <>
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16.65" y2="16.65" />
  </>,
  warning: <>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>,
  check: <polyline points="20 6 9 17 4 12" />,
  "chevron-down": <polyline points="6 9 12 15 18 9" />,
  "chevron-right": <polyline points="9 6 15 12 9 18" />,
  "chevron-left": <polyline points="15 6 9 12 15 18" />,
  sort: <>
    <polyline points="6 9 12 3 18 9" />
    <polyline points="6 15 12 21 18 15" />
  </>,
  plus: <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
  close: <>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </>,
  settings: <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33 1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82 1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </>,
  drag: <>
    <circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </>,
  calendar: <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
  </>,
  clock: <>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 14" />
  </>,
  filter: <polygon points="3 4 21 4 14 13 14 20 10 18 10 13 3 4" />,
  document: <>
    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
    <polyline points="14 3 14 8 19 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </>,
  trash: <>
    <polyline points="4 7 20 7" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" />
    <path d="M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
  </>,
  info: <>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
  </>,
  pin: <>
    <path d="M12 2C8.5 2 6 4.5 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.5-2.5-6-6-6z" />
    <circle cx="12" cy="8" r="2" />
  </>,
  download: <>
    <path d="M12 4v12" />
    <polyline points="7 11 12 16 17 11" />
    <line x1="4" y1="20" x2="20" y2="20" />
  </>,
  eye: <>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </>,
  refresh: <>
    <path d="M3 12a9 9 0 0115-6.7L21 8" />
    <polyline points="21 3 21 8 16 8" />
    <path d="M21 12a9 9 0 01-15 6.7L3 16" />
    <polyline points="3 21 3 16 8 16" />
  </>,

  // ── Allergen glyphs (the 14 statutory allergens) ──────────
  celery: <>
    <path d="M8.5 21l1-9M12 21v-9M15.5 21l-1-9" />
    <path d="M9.5 12c-2-1-3-3-2-5 2 0 3.2 2 3 4" />
    <path d="M14.5 12c2-1 3-3 2-5-2 0-3.2 2-3 4" />
  </>,
  gluten: <>
    <path d="M12 21V7" />
    <path d="M12 7c0-2 1.6-3.6 3-4.2M12 7c0-2-1.6-3.6-3-4.2" />
    <path d="M12 12c0-2 1.6-3 3-3.6M12 12c0-2-1.6-3-3-3.6" />
    <path d="M12 16.5c0-2 1.6-3 3-3.6M12 16.5c0-2-1.6-3-3-3.6" />
  </>,
  crustaceans: <>
    <path d="M17 6c-4.5 0-8.5 3.2-8.5 7.2 0 3 2.2 4.8 5 4.8" />
    <path d="M17 6c1.8 0 2.8 1 3 2.2" />
    <path d="M13.5 18l1 2M11 17.2v2.6M8.8 15l-1.3 2" />
  </>,
  eggs: <>
    <ellipse cx="12" cy="13" rx="6" ry="7" />
    <circle cx="12" cy="14" r="2.6" />
  </>,
  fish: <>
    <path d="M4 12c2-3 6-4.5 9-4.5s5.5 1.5 6.5 4.5c-1 3-3.5 4.5-6.5 4.5s-7-1.5-9-4.5z" />
    <path d="M19.5 12l3-3v6z" />
    <circle cx="8.5" cy="11" r="0.7" fill="currentColor" stroke="none" />
  </>,
  lupin: <>
    <path d="M12 21v-9" />
    <path d="M9.5 6.5a2.5 2 0 015 0M9.5 9a2.5 2 0 015 0M9.5 11.5a2.5 2 0 015 0" />
    <path d="M12 21c-2.2-.8-3.5-2.2-3.5-4.2" />
  </>,
  milk: <>
    <path d="M8.5 9.5h7v10a1 1 0 01-1 1h-5a1 1 0 01-1-1z" />
    <path d="M8.5 9.5l3.5-4 3.5 4" />
    <line x1="12" y1="5.5" x2="12" y2="9.5" />
  </>,
  molluscs: <>
    <path d="M12 20L5 10a8 8 0 0114 0z" />
    <path d="M12 20V10M8.8 19l-1.6-8M15.2 19l1.6-8" />
  </>,
  mustard: <>
    <path d="M9 21V10.5a3 3 0 013-3 3 3 0 013 3V21z" />
    <rect x="10.3" y="4" width="3.4" height="3.5" rx="0.5" />
  </>,
  nuts: <>
    <ellipse cx="12" cy="13" rx="4.2" ry="5" />
    <path d="M7.2 9.5c1-2 3-3 4.8-3s3.8 1 4.8 3" />
    <line x1="12" y1="6" x2="12" y2="3.8" />
  </>,
  peanuts: <path d="M12 3c2 0 3.2 1.6 3.2 3.6 0 1 .5 1.6 1.1 2.6.8 1.4.8 3.2 0 4.6-.6 1-1.1 1.6-1.1 2.6 0 2-1.2 3.6-3.2 3.6S8.8 18.4 8.8 16.4c0-1-.5-1.6-1.1-2.6-.8-1.4-.8-3.2 0-4.6.6-1 1.1-1.6 1.1-2.6C8.8 4.6 10 3 12 3z" />,
  sesame: <>
    <ellipse cx="9" cy="13" rx="1.4" ry="3.1" transform="rotate(-22 9 13)" />
    <ellipse cx="13.2" cy="10.8" rx="1.4" ry="3.1" transform="rotate(16 13.2 10.8)" />
    <ellipse cx="14" cy="16" rx="1.4" ry="3.1" transform="rotate(-32 14 16)" />
  </>,
  soya: <>
    <rect x="10" y="3.5" width="4" height="17" rx="2" transform="rotate(35 12 12)" />
    <circle cx="8.8" cy="15.2" r="1.3" />
    <circle cx="12" cy="12" r="1.3" />
    <circle cx="15.2" cy="8.8" r="1.3" />
  </>,
  sulphites: <>
    <path d="M8 4h8c0 4.2-2 8-4 8s-4-3.8-4-8z" />
    <line x1="12" y1="12" x2="12" y2="19" />
    <line x1="9" y1="19.5" x2="15" y2="19.5" />
  </>,
};

function Icon({ name, size = 16, style }) {
  const body = ICON_PATHS[name];
  if (!body) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {body}
    </svg>
  );
}

Object.assign(window, { Icon, ICON_PATHS });
