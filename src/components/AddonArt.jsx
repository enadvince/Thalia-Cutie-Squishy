// Drawings for every add-on, centered on (0,0) inside a ~24-unit box.
// Shared by the option cards and the preview jar so both always match.
// Character beads are original designs (no existing characters).
const INK = '#3b2a4a'
const BLUSH = '#ff7eb6'

const Eyes = ({ y = 0, dx = 3.2, r = 1.2 }) => (
  <>
    <circle cx={-dx} cy={y} r={r} fill={INK} />
    <circle cx={dx} cy={y} r={r} fill={INK} />
    <circle cx={-dx + 0.4} cy={y - 0.4} r={r * 0.35} fill="#fff" />
    <circle cx={dx + 0.4} cy={y - 0.4} r={r * 0.35} fill="#fff" />
  </>
)
const Blush = ({ y = 2, dx = 5 }) => (
  <>
    <ellipse cx={-dx} cy={y} rx="1.6" ry="0.9" fill={BLUSH} opacity="0.6" />
    <ellipse cx={dx} cy={y} rx="1.6" ry="0.9" fill={BLUSH} opacity="0.6" />
  </>
)
const Smile = ({ y = 2.2 }) => (
  <path d={`M-1.2 ${y}q1.2 1.2 2.4 0`} fill="none" stroke={INK} strokeWidth="0.7" strokeLinecap="round" />
)
const Shine = ({ x = -2, y = -2, r = 1.2 }) => <circle cx={x} cy={y} r={r} fill="#fff" opacity="0.8" />

const star = (r, inner = r * 0.45) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rad = i % 2 ? inner : r
    return `${(Math.cos(a) * rad).toFixed(2)},${(Math.sin(a) * rad).toFixed(2)}`
  }).join(' ')

const ART = {
  bead: ({ color = '#a98bff' }) => (
    <>
      <circle r="5" fill={color} />
      <Shine x={-1.6} y={-1.8} r={1.4} />
    </>
  ),
  glitter: ({ color = '#ffd84d' }) => (
    <path d="M0 -4L1 -1L4 0L1 1L0 4L-1 1L-4 0L-1 -1Z" fill={color} />
  ),
  star: ({ color = '#ffd84d' }) => (
    <>
      <polygon points={star(6.5)} fill={color} stroke="#fff" strokeWidth="0.6" strokeLinejoin="round" />
      <Shine x={-1.5} y={-1.5} r={1} />
    </>
  ),
  heart: ({ color = '#ff7eb6' }) => (
    <>
      <path d="M0 5.5S-6 2-6 -1.5A3 3 0 010 -3a3 3 0 016 1.5C6 2 0 5.5 0 5.5z" fill={color} />
      <Shine x={-2.6} y={-1.6} r={1} />
    </>
  ),
  sprinkle: ({ color = '#4fd1c5' }) => <rect x="-1.2" y="-4" width="2.4" height="8" rx="1.2" fill={color} />,
  starSprinkle: ({ color = '#fff' }) => <polygon points={star(3.2)} fill={color} />,
  pompom: ({ color = '#ffb3d6' }) => (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (Math.PI / 6) * i
        return <circle key={i} cx={Math.cos(a) * 4} cy={Math.sin(a) * 4} r="2.4" fill={color} />
      })}
      <circle r="4.5" fill={color} />
      <Shine x={-1.8} y={-1.8} r={1.3} />
    </>
  ),
  // Bonus bead: rainbow-striped ball.
  rainbowBead: () => (
    <>
      <clipPath id="rb-clip">
        <circle r="5.5" />
      </clipPath>
      <g clipPath="url(#rb-clip)">
        {['#ff7eb6', '#ffd84d', '#85de7c', '#9fc7f4', '#a98bff'].map((c, i) => (
          <rect key={c} x="-6" y={-6 + i * 2.4} width="12" height="2.5" fill={c} />
        ))}
      </g>
      <Shine x={-1.8} y={-2} r={1.4} />
    </>
  ),
  // Bonus bead: sleepy crescent moon.
  moon: () => (
    <>
      <path d="M2 -6A6.5 6.5 0 102 6 5 5 0 012 -6z" fill="#ffd84d" />
      <path d="M-3.5 0.5q1 1 2 0" fill="none" stroke={INK} strokeWidth="0.7" strokeLinecap="round" />
      <ellipse cx="-2" cy="2.4" rx="1.1" ry="0.6" fill={BLUSH} opacity="0.6" />
    </>
  ),
  // Daily surprises
  gem: ({ color = '#9fc7f4' }) => (
    <>
      <path d="M-5 -1.5L-2.5 -5H2.5L5 -1.5L0 5.5Z" fill={color} stroke="#fff" strokeWidth="0.6" strokeLinejoin="round" />
      <path d="M-5 -1.5H5M-2.5 -5L0 5.5L2.5 -5" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.7" />
    </>
  ),
  snowflake: () => (
    <g stroke="#9fc7f4" strokeWidth="1.1" strokeLinecap="round">
      {[0, 60, 120].map((a) => (
        <path key={a} d="M0 -5V5M-1.5 -3.5L0 -2L1.5 -3.5M-1.5 3.5L0 2L1.5 3.5" transform={`rotate(${a})`} />
      ))}
    </g>
  ),
  clover: () => (
    <>
      {[0, 90, 180, 270].map((a) => (
        <circle key={a} cx="0" cy="-2.8" r="2.6" fill="#85de7c" transform={`rotate(${a})`} />
      ))}
      <circle r="1.2" fill="#5bd350" />
    </>
  ),
  shell: () => (
    <>
      <path d="M-5.5 2.5C-5.5 -3 -2.5 -5.5 0 -5.5S5.5 -3 5.5 2.5L0 5Z" fill="#fce2cf" stroke="#f8b17f" strokeWidth="0.6" />
      <path d="M0 5V-5M0 5L-3 -4M0 5L3 -4" stroke="#f8b17f" strokeWidth="0.5" />
    </>
  ),
  flower: ({ color = '#ffb3d6' }) => (
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-3.2" rx="2" ry="2.8" fill={color} transform={`rotate(${a})`} />
      ))}
      <circle r="1.8" fill="#ffd84d" />
    </>
  ),
  // Fluffy white cloud-shaped puppy with lilac floppy ears.
  cloudPuppy: () => (
    <>
      <ellipse cx="-7" cy="0" rx="2.6" ry="4.5" fill="#d4bfff" transform="rotate(18 -7 0)" />
      <ellipse cx="7" cy="0" rx="2.6" ry="4.5" fill="#d4bfff" transform="rotate(-18 7 0)" />
      <path d="M-7 4a3 3 0 01-1-5 4 4 0 015-4.5 4.5 4.5 0 016 0 4 4 0 015 4.5 3 3 0 01-1 5z" fill="#fff" stroke="#e6dcf7" strokeWidth="0.5" />
      <Eyes y={-0.5} dx={2.8} />
      <ellipse cx="0" cy="1.6" rx="1" ry="0.7" fill={INK} />
      <Blush y={2} dx={4.6} />
    </>
  ),
  // Lilac cat with a big aqua bow centered on top.
  bowKitty: () => (
    <>
      <path d="M-7 -2L-6 -8L-2 -5.5ZM7 -2L6 -8L2 -5.5Z" fill="#d4bfff" />
      <ellipse rx="7.5" ry="6" cy="0.5" fill="#d4bfff" />
      <path d="M0 -6.5L-4 -9V-4ZM0 -6.5L4 -9V-4Z" fill="#4fd1c5" />
      <circle cy="-6.5" r="1.3" fill="#9eede5" />
      <Eyes y={0} dx={3} />
      <path d="M-1.2 2.2q0.6 0.8 1.2 0q0.6 0.8 1.2 0" fill="none" stroke={INK} strokeWidth="0.6" strokeLinecap="round" />
      <Blush y={2.4} dx={5} />
    </>
  ),
  // Mint bunny with long ears and two tiny pink imp horns.
  bunnyImp: () => (
    <>
      <ellipse cx="-3" cy="-8" rx="1.8" ry="5" fill="#9eede5" />
      <ellipse cx="3" cy="-8" rx="1.8" ry="5" fill="#9eede5" />
      <path d="M-1.6 -5.5l-.8 -2.4 1.8 1.4zM1.6 -5.5l.8 -2.4 -1.8 1.4z" fill={BLUSH} />
      <ellipse rx="6.5" ry="5.8" cy="0.5" fill="#9eede5" />
      <Eyes y={0} dx={2.6} />
      <path d="M-1.4 2.2q1.4 1.3 2.8 -.2" fill="none" stroke={INK} strokeWidth="0.7" strokeLinecap="round" />
      <Blush y={2.2} dx={4.4} />
    </>
  ),
  // Pink lamb: fluffy pink wool around a cream face.
  pinkLamb: () => (
    <>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (Math.PI / 5) * i
        return <circle key={i} cx={Math.cos(a) * 6} cy={Math.sin(a) * 5.5} r="3" fill="#ffb3d6" />
      })}
      <ellipse cx="-6.5" cy="0" rx="2.6" ry="1.3" fill="#ffe4f1" />
      <ellipse cx="6.5" cy="0" rx="2.6" ry="1.3" fill="#ffe4f1" />
      <ellipse rx="4.6" ry="4.4" cy="1" fill="#fff8d6" />
      <Eyes y={0.4} dx={2} r={0.9} />
      <Smile y={2.4} />
    </>
  ),
  // Butter-yellow pup with apricot floppy ears.
  sunnyPup: () => (
    <>
      <ellipse rx="7" ry="6" fill="#ffeb99" />
      <ellipse cx="-6.5" cy="-1" rx="2.4" ry="4" fill="#f8b17f" transform="rotate(25 -6.5 -1)" />
      <ellipse cx="6.5" cy="-1" rx="2.4" ry="4" fill="#f8b17f" transform="rotate(-25 6.5 -1)" />
      <ellipse cy="2" rx="3" ry="2.2" fill="#fff8d6" />
      <Eyes y={-0.8} dx={2.6} />
      <ellipse cy="1.2" rx="0.9" ry="0.6" fill={INK} />
      <Blush y={1.6} dx={4.6} />
    </>
  ),
}

// Colors used when an add-on appears several times (beads, glitter, sprinkles vary).
export const ART_PALETTES = {
  bead: ['#a98bff', '#4fd1c5', '#ff7eb6', '#ffd84d', '#9fc7f4'],
  glitter: ['#ffd84d', '#ffffff', '#d4bfff', '#9eede5'],
  star: ['#ffd84d', '#ffb3d6', '#9eede5'],
  heart: ['#ff7eb6', '#ffb3d6', '#a98bff'],
  sprinkle: ['#4fd1c5', '#ff7eb6', '#ffd84d', '#a98bff', '#ffffff'],
  starSprinkle: ['#ffffff', '#ffd84d', '#ffb3d6'],
  pompom: ['#ffb3d6', '#d4bfff', '#9eede5', '#ffeb99'],
  gem: ['#9fc7f4', '#d4bfff', '#9eede5', '#ffb3d6'],
  flower: ['#ffb3d6', '#d4bfff', '#ffffff'],
}

export default function AddonArt({ art, index = 0 }) {
  const Draw = ART[art]
  const palette = ART_PALETTES[art]
  return <Draw color={palette?.[index % palette.length]} />
}

// Option-card thumbnail. Tiny add-ons (glitter, sprinkles) show as a little cluster so they're easy to see.
const CLUSTER = [
  [-5, -4, 0],
  [5, -5, 1],
  [-4, 5, 2],
  [5, 5, 3],
  [0, 0, 4],
]
const TINY = new Set(['glitter', 'sprinkle', 'starSprinkle'])

export function AddonThumb({ art }) {
  return (
    <svg viewBox="-12 -12 24 24" className="size-full overflow-visible" aria-hidden="true">
      {TINY.has(art) ? (
        CLUSTER.map(([x, y, i]) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${i * 37})`}>
            <g stroke="#3b2a4a" strokeOpacity="0.25" strokeWidth="0.4">
              <AddonArt art={art} index={i + 1} />
            </g>
          </g>
        ))
      ) : (
        <AddonArt art={art} />
      )}
    </svg>
  )
}
