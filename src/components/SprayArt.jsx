// Spray speckles, centered on (0,0). Shared by the casing preview and the spray option cards.
const star = (r, inner = r * 0.45) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rad = i % 2 ? inner : r
    return `${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)}`
  }).join(' ')

const PALETTES = {
  glitter: ['#ffffff', '#ffd84d', '#d4bfff', '#9eede5', '#ffb3d6'],
  star: ['#ffd84d', '#ffffff', '#ffb3d6'],
  heart: ['#ff7eb6', '#ffffff', '#d4bfff'],
  diamond: ['#e8f7ff', '#9fc7f4', '#ffffff'],
  bubble: ['#ffffff'],
}

const ART = {
  glitter: (c) => <path d="M0 -3L.8 -.8L3 0L.8 .8L0 3L-.8 .8L-3 0L-.8 -.8Z" fill={c} />,
  star: (c) => <polygon points={star(5)} fill={c} stroke="#fff" strokeWidth="0.5" />,
  heart: (c) => <path d="M0 4.2S-4.6 1.6-4.6-1.2A2.3 2.3 0 010-2.3a2.3 2.3 0 014.6 1.1C4.6 1.6 0 4.2 0 4.2z" fill={c} />,
  diamond: (c) => (
    <>
      <path d="M-4 -1.5L-2 -4H2L4 -1.5L0 4.5Z" fill={c} stroke="#5b7bea" strokeOpacity="0.35" strokeWidth="0.5" />
      <path d="M-4 -1.5H4M-2 -4L0 4.5L2 -4" fill="none" stroke="#5b7bea" strokeOpacity="0.3" strokeWidth="0.4" />
    </>
  ),
  bubble: (c) => (
    <>
      <circle r="4.5" fill={c} fillOpacity="0.25" stroke={c} strokeWidth="0.9" />
      <circle cx="-1.6" cy="-1.6" r="1" fill="#fff" />
    </>
  ),
}

export default function SprayArt({ art, index = 0 }) {
  const palette = PALETTES[art]
  return ART[art](palette[index % palette.length])
}
