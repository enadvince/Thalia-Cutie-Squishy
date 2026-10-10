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
