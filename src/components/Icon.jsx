// Simple rounded inline-SVG icons (no icon font, works offline).
// Icons are decorative: the button that holds one always carries an aria-label or visible text.
const PATHS = {
  // System chrome
  chevronBack: <path d="M15 5l-7 7 7 7" />,
  arrowBack: <path d="M20 12H5m6-7l-7 7 7 7" />,
  arrowNext: <path d="M4 12h15m-6-7l7 7-7 7" />,
  undo: <path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" />,
  soundOn: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />
    </>
  ),
  soundOff: (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M17 9l5 6M22 9l-5 6" />
    </>
  ),
  speak: (
    <>
      <path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2h-7l-5 4v-4H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  play: <path d="M8 5.5v13l11-6.5-11-6.5z" />,
  sparkle: <path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />,
  // Step icons
  jar: (
    <>
      <path d="M8 3h8v3H8zM7 6h10l1 3v9a3 3 0 01-3 3H9a3 3 0 01-3-3V9l1-3z" />
      <path d="M6 13c3-2 6 2 12 0" />
    </>
  ),
  shell: <path d="M4 15c0-6 3.6-10 8-10s8 4 8 10c0 3-3.6 5-8 5s-8-2-8-5z" />,
  bag: (
    <>
      <path d="M4 4l9 4 4 9-3 3-9-4L4 4z" />
      <path d="M17 17l3 3" />
    </>
  ),
  hand: (
    <path d="M8 13V6a1.5 1.5 0 013 0v5V4.5a1.5 1.5 0 013 0V11V5.5a1.5 1.5 0 013 0V14c0 4-2.5 7-6 7-2.5 0-4-1.5-5.5-3.5L4 14.5a1.5 1.5 0 012.3-1.9L8 14" />
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 15 15 15h2a4 4 0 004-4c0-4.4-4-8-9-8z" />
      <circle cx="7.5" cy="11" r="1.2" />
      <circle cx="10.5" cy="7" r="1.2" />
      <circle cx="15" cy="8" r="1.2" />
    </>
  ),
  bead: (
    <>
      <circle cx="8" cy="9" r="4" />
      <circle cx="16" cy="15" r="4" />
      <path d="M7 7.5a1.5 1.5 0 012-1M15 13.5a1.5 1.5 0 012-1" />
    </>
  ),
  // Casing step
  spray: (
    <>
      <path d="M8 10h7v11H8zM9 10V7h5v3M14 7h3l1-2" />
      <path d="M19 4.5h.01M21 6.5h.01M21 3h.01" />
    </>
  ),
  scent: <path d="M6 20c-2-3 2-5 0-8s2-5 0-8M12 20c-2-3 2-5 0-8s2-5 0-8M18 20c-2-3 2-5 0-8s2-5 0-8" />,
  shapes: (
    <>
      <circle cx="7.5" cy="7.5" r="4" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
      <path d="M17 3l4 7h-8zM7.5 14.5l1.2 2.5 2.8.4-2 2 .5 2.6-2.5-1.3-2.5 1.3.5-2.6-2-2 2.8-.4z" />
    </>
  ),
  balloon: (
    <>
      <path d="M12 3c3.9 0 6.5 3 6.5 6.6 0 4-3.3 7.4-6.5 7.4S5.5 13.6 5.5 9.6C5.5 6 8.1 3 12 3z" />
      <path d="M11 17l1 1.5 1-1.5M12 18.5c0 1.5-2 1.5-2 3" />
    </>
  ),
  shine: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <path d="M8 9.5a3 3 0 012.5-2.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="3" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </>
  ),
  // Play step
  pencil: <path d="M4 20l1-5L15.5 4.5a2.1 2.1 0 013 3L8 18zM13.5 6.5l4 4" />,
  stretch: <path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" />,
  poke: (
    <>
      <path d="M9 21v-6.5L6.5 12a1.6 1.6 0 012.3-2.3L10 11V4.5a1.5 1.5 0 013 0V10l4.5 1a2 2 0 011.5 2.2L18 21" />
      <path d="M3 4l2 1.5M3 9h2" />
    </>
  ),
  shake: (
    <>
      <rect x="8" y="4" width="8" height="16" rx="2.5" />
      <path d="M4 8q-1.5 4 0 8M20 8q1.5 4 0 8" />
    </>
  ),
  shelf: (
    <>
      <path d="M3 20h18M3 12h18M5 12V4h4v8M11 12V6h3v6M16 20v-5h3v5M6 20v-4h5v4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  // Rewards and Shelf
  star: <path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" />,
  gift: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M3 7h18v3H3zM12 7v13M12 7c-2-4-6-4-6-1.5S10 7 12 7zM12 7c2-4 6-4 6-1.5S14 7 12 7z" />
    </>
  ),
  trash: <path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13M10 11v5M14 11v5" />,
  medal: (
    <>
      <circle cx="12" cy="14" r="6" />
      <path d="M8 3l2.5 5.5M16 3l-2.5 5.5M12 11.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z" />
    </>
  ),
  home: <path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z" />,
  // Filling types
  crunch: <path d="M4 15l3-6 4 3 3-6 3 5 3-2v8H4z M8 18h1M13 17h1M17 18h.5" />,
  rise: (
    <>
      <path d="M4 19c0-5 3.6-8 8-8s8 3 8 8z" />
      <path d="M12 8V3m-3 3l3-3 3 3" />
    </>
  ),
  drip: <path d="M4 5h16v4c0 1.5-1 2-2 2s-2 .5-2 2v4a2 2 0 01-4 0v-2c0-1-.5-1.5-1.5-1.5S9 14 9 15v.5a1.5 1.5 0 01-3 0V11c0-1-.5-1.5-1-1.5S4 9 4 8z" />,
  dough: (
    <>
      <path d="M3 16c0-4 4-8 9-8s9 4 9 8c0 2-4 3-9 3s-9-1-9-3z" />
      <path d="M9 13.5c1-1 2.5-1 3.5 0M11 15.5c.8-.6 1.6-.6 2.4 0" />
    </>
  ),
  butter: (
    <>
      <path d="M3 14l5-6h13l-5 6z" />
      <path d="M3 14v4h13v-4M16 18l5-6V8" />
    </>
  ),
  putty: (
    <>
      <path d="M12 3c4 0 7 6 7 11a7 7 0 01-14 0c0-5 3-11 7-11z" />
      <path d="M9.5 13a2.5 2.5 0 003 3" />
    </>
  ),
  // Color families
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0112 7.5 4.2 4.2 0 0119.5 10c0 5.4-7.5 10-7.5 10z" />,
  berry: (
    <>
      <path d="M12 8c4 0 7 2 7 5.5S15.5 21 12 21s-7-4-7-7.5S8 8 12 8z" />
      <path d="M9 5l3 3 3-3M12 8V3" />
    </>
  ),
  citrus: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6L6 18" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </>
  ),
  leaf: <path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15zM5 19l8-8" />,
  drop: <path d="M12 3s7 7.5 7 12a7 7 0 01-14 0c0-4.5 7-12 7-12z" />,
  cloud: <path d="M7 18a4 4 0 01-.5-8A5.5 5.5 0 0117 8.5a4.75 4.75 0 01.5 9.5z" />,
  grape: (
    <>
      <circle cx="9" cy="10" r="2.6" />
      <circle cx="15" cy="10" r="2.6" />
      <circle cx="12" cy="14.5" r="2.6" />
      <circle cx="12" cy="19.5" r="2" />
      <path d="M12 7.5V3l2 1" />
    </>
  ),
  cookie: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9h.01M14.5 8.5h.01M15 14h.01M9.5 15h.01M12 12h.01" />
    </>
  ),
  rainbow: <path d="M3 18a9 9 0 0118 0M6.5 18a5.5 5.5 0 0111 0M10 18a2 2 0 014 0" />,
}

export default function Icon({ name, size = 28, filled = false, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {PATHS[name]}
    </svg>
  )
}
