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
