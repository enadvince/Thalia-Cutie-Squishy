import { useEffect, useId, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { shapeById } from '../data/shapes'
import { casingTypeById } from '../data/casings'
import { sprayById } from '../data/sprays'
import { scentLook, SCENT_TINT_AMOUNT } from '../data/scents'
import { stickerById, stickerSrc, FIRST_STARTER } from '../data/stickers'
import { colorById } from '../data/colors'
import { mix } from '../lib/color'
import { seeded, safeId } from '../lib/random'
import SprayArt from './SprayArt'
import ScentArt from './ScentArt'
import FillingMass from './FillingMass'

const INK = '#3b2a4a'

// Casing color: a light version of her first filling color, with the scent's tint blended in.
export function casingColor(draft) {
  const base = mix(colorById(draft.fillingColors[0]).hex, '#ffffff', 0.55)
  return mix(base, scentLook(draft).tint, SCENT_TINT_AMOUNT)
}

// Draws a shape's parts (circles, ellipses, rects, paths) with the given props.
export function ShapeParts({ parts, ...props }) {
  return parts.map((p, i) => {
    if (p.c) return <circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.c[2]} {...props} />
    if (p.e) {
      const [cx, cy, rx, ry, rot = 0] = p.e
      return <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} {...props} />
    }
    if (p.r) return <rect key={i} x={p.r[0]} y={p.r[1]} width={p.r[2]} height={p.r[3]} rx={p.r[4]} {...props} />
    return <path key={i} d={p.d} {...(p.evenodd && { fillRule: 'evenodd', clipRule: 'evenodd' })} {...props} />
  })
}

export function Face({ face }) {
  const { x, y, s, pixel } = face
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {pixel ? (
        <>
          <rect x="-30" y="-10" width="16" height="16" fill={INK} />
          <rect x="14" y="-10" width="16" height="16" fill={INK} />
          <rect x="-26" y="-8" width="5" height="5" fill="#fff" />
          <rect x="18" y="-8" width="5" height="5" fill="#fff" />
          <rect x="-8" y="12" width="16" height="5" fill={INK} />
        </>
      ) : (
        <>
          <ellipse cx="-30" cy="-6" rx="12" ry="14" fill={INK} />
          <ellipse cx="30" cy="-6" rx="12" ry="14" fill={INK} />
          <circle cx="-26" cy="-12" r="4.8" fill="#fff" />
          <circle cx="34" cy="-12" r="4.8" fill="#fff" />
          <circle cx="-34" cy="0" r="2" fill="#fff" />
          <circle cx="26" cy="0" r="2" fill="#fff" />
          <path d="M-8 12q8 8 16 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="-50" cy="12" rx="12" ry="6.5" fill="#ff7eb6" opacity="0.5" />
      <ellipse cx="50" cy="12" rx="12" ry="6.5" fill="#ff7eb6" opacity="0.5" />
    </g>
  )
}

// Extra details for some shapes (drawn over the casing).
function ShapeDecor({ decor, color }) {
  const line = { fill: 'none', stroke: INK, strokeOpacity: 0.2, strokeWidth: 3, strokeLinecap: 'round' }
  switch (decor) {
    case 'pleats':
      return <path d="M98 74q8 14 4 28M130 68v30M162 74q-8 14-4 28" {...line} />
    case 'tentacles':
      return (
        <g fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" opacity="0.85">
          <path d="M66 162q-10 20 4 38t-2 30M104 164q8 22-4 40t6 24M156 164q-8 22 4 40t-6 24M194 162q10 20-4 38t2 30" />
        </g>
      )
    case 'gills':
      return (
        <g fill="none" stroke="#ff9fd2" strokeWidth="9" strokeLinecap="round">
          <path d="M48 112l-26-24M42 132l-34-8M46 152l-30 10M212 112l26-24M218 132l34-8M214 152l30 10" />
        </g>
      )
    case 'butterEdges':
      return <path d="M14 124H222V212M222 124L246 98" {...line} />
    case 'crust':
      return <path d="M60 104q20-14 38-6M120 92q12-10 24 0M168 98q18-6 32 8" {...line} />
    case 'snout':
      return <ellipse cx="130" cy="176" rx="30" ry="20" fill="#fff" opacity="0.35" />
    case 'facets':
      return <path d="M24 98H236M72 40L104 98L130 232M188 40L156 98L130 232M104 98L130 40L156 98" {...line} />
    case 'icing':
      return (
        <g>
          <path d="M40 120q16-10 30 4t30-6 30 6 30-6 30 6 32-4" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
          {[[60, 96, 30], [98, 66, -20], [150, 62, 40], [196, 92, -35], [82, 186, 15], [182, 182, -10]].map(([x, y, r], i) => (
            <rect key={i} x={x - 2} y={y - 7} width="4" height="14" rx="2" fill={['#ff7eb6', '#4fd1c5', '#ffd84d', '#a98bff'][i % 4]} transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </g>
      )
    case 'boba':
      return (
        <g>
          <rect x="150" y="-2" width="14" height="96" rx="7" fill="#ff9fd2" stroke="#fff" strokeWidth="2" transform="rotate(18 157 46)" />
          <path d="M56 90H204" {...line} />
          {[[100, 222], [122, 230], [146, 226], [166, 216], [112, 206], [138, 210], [90, 210]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="9" fill="#5a3a2e" opacity="0.8" />
          ))}
        </g>
      )
    case 'sugarCoat':
      return (
        <g fill="#fff" opacity="0.75">
          {[[70, 120, 20], [100, 86, -15], [150, 78, 30], [182, 112, -25], [60, 180, 10], [204, 176, 35], [118, 120, 45], [160, 132, -40], [96, 210, 5], [170, 208, -20], [130, 66, 0], [84, 150, 60], [190, 146, 15]].map(([x, y, r], i) => (
            <rect key={i} x={x - 3} y={y - 3} width="6" height="6" rx="1" transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </g>
      )
    case 'whiskers':
      return <path d="M60 166H28M62 178L32 188M200 166H232M198 178L228 188" {...line} />
    default:
      return null
  }
}

const METAL = '#c7cedd'
const METAL_DARK = '#8f99b0'

// Keychain, bag clip, necklace or phone charm, hanging from `at` (the top of the shape).
export function Accessory({ kind, at }) {
  const [x, y] = at
  const len = Math.min(58, y + 12) // keep it inside the picture
  const top = y - len
  const cap = <rect x={x - 9} y={y - 7} width="18" height="10" rx="3" fill={METAL} stroke={METAL_DARK} strokeWidth="1.5" />
  const links = (from, to) => {
    const out = []
    for (let cy = from, i = 0; cy > to; cy -= 9, i++) {
      out.push(
        i % 2 ? (
          <rect key={cy} x={x - 1.5} y={cy - 6} width="3" height="11" rx="1.5" fill={METAL} stroke={METAL_DARK} strokeWidth="1" />
        ) : (
          <ellipse key={cy} cx={x} cy={cy} rx="3.5" ry="6" fill="none" stroke={METAL} strokeWidth="2.5" />
        ),
      )
    }
    return out
  }
  switch (kind) {
    case 'keychain':
      return (
        <g>
          {links(y - 12, top + 22)}
          <circle cx={x} cy={top + 10} r="13" fill="none" stroke={METAL} strokeWidth="4.5" />
          <circle cx={x} cy={top + 10} r="13" fill="none" stroke={METAL_DARK} strokeWidth="1" strokeOpacity="0.6" />
          <path d={`M${x - 9} ${top + 2}a12 12 0 0 1 9 -4`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          {cap}
        </g>
      )
    case 'bag-clip':
      return (
        <g>
          {links(y - 12, top + 26)}
          <rect x={x - 10} y={top} width="20" height="28" rx="10" fill="none" stroke="#a98bff" strokeWidth="5" />
          <path d={`M${x + 10} ${top + 9}v10`} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          {cap}
        </g>
      )
    case 'necklace': {
      const beads = [0.25, 0.5, 0.75].flatMap((t) => [
        [x - 70 * t, y - 6 - (y + 14) * t],
        [x + 70 * t, y - 6 - (y + 14) * t],
      ])
      return (
        <g>
          <path d={`M${x - 70} -20L${x} ${y - 6}L${x + 70} -20`} fill="none" stroke="#ff9fd2" strokeWidth="3.5" strokeLinejoin="round" />
          {beads.map(([bx, by], i) => (
            <circle key={i} cx={bx} cy={by} r="5" fill={['#ffd84d', '#9eede5', '#d4bfff'][i % 3]} stroke="#fff" strokeWidth="1.2" />
          ))}
          {cap}
        </g>
      )
    }
    case 'phone-charm': {
      const beads = []
      for (let cy = y - 13, i = 0; cy > top + 16; cy -= 9.5, i++) beads.push([cy, ['#ff7eb6', '#9eede5', '#ffd84d', '#a98bff'][i % 4]])
      return (
        <g>
          <ellipse cx={x} cy={top + 9} rx="8" ry="11" fill="none" stroke="#ff9fd2" strokeWidth="3" />
          {beads.map(([cy, c]) => (
            <circle key={cy} cx={x} cy={cy} r="4.8" fill={c} stroke="#fff" strokeWidth="1.2" />
          ))}
          {cap}
        </g>
      )
    }
    default:
      return null
  }
}

// Where the printed words go: a shape's own `label` spot, else just under its face.
export function labelSpot(shape) {
  if (shape.label) return shape.label
  const f = shape.face ?? { x: 130, y: 110, s: 1 }
  return [f.x, f.y + 50 * f.s, 150]
}

// Words printed on the casing. Sized to fit the spot; the shape's clip trims anything past the edge,
// and in Play it's part of the casing picture, so it bends with the squishy like real print.
function PrintedLabel({ text, spot }) {
  const [x, y, width, max = 30] = spot
  const size = Math.min(max, width / (text.length * 0.6))
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontFamily="Fredoka, 'Arial Rounded MT Bold', 'Trebuchet MS', sans-serif"
      fontWeight="700"
      fontSize={size.toFixed(1)}
      fill={INK}
      fillOpacity="0.78"
      stroke="#fff"
      strokeOpacity="0.85"
      strokeWidth={(size * 0.16).toFixed(1)}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {text}
    </text>
  )
}

// Bubble Wrap: a honeycomb of little bubbles over the whole picture (viewBox units).
export const BUBBLE_R = 9
export const BUBBLES = (() => {
  const out = []
  const dx = 22
  const dy = 19
  for (let row = 0, y = -12; y < 262; row++, y += dy) {
    for (let x = -6 + (row % 2) * (dx / 2); x < 272; x += dx) out.push([x, y])
  }
  return out
})()

// Area the filling occupies inside any shape (the shape's clip trims it).
export const FILL_BOX = { x: 20, y: 22, w: 220, h: 228 }

// How the casing looks at a fill level: squashed when empty, round when full, a little bulgy when overfilled.
export function inflation(fill) {
  const f = Math.min(fill, 1)
  const extra = Math.max(0, fill - 1) * 0.3
  return { scaleX: 0.86 + 0.14 * f + extra, scaleY: 0.72 + 0.28 * f + extra }
}

// The squishy: shape + casing type + spray + scent.
// `fill` (Step 3 onward) pours the filling in and inflates the casing; `jiggle` and `burst`
// are counters that play a happy jiggle / sparkle burst each time they go up.
// For Step 4's soft-body canvas, `still` renders without animation and `layer` picks one part:
//   'all' (default) · 'inner' (filling, no add-ons) · 'casing' (everything over the filling, minus a
//   wax coat or bubbles) · 'wax' (just the wax coat, which Play breaks into chips) · 'bubbles' (just
//   the bubble-wrap bubbles, which Play pops) · 'scent'
export default function SquishyView({ draft, fill, jiggle = 0, burst = 0, still = false, layer = 'all' }) {
  const uid = safeId(useId())
  const shape = shapeById(draft.shape)
  const type = casingTypeById(draft.casingType)
  const spray = sprayById(draft.spray)
  const scent = scentLook(draft)
  const color = casingColor(draft)
  const sticker = stickerById(draft.sticker) ?? FIRST_STARTER
  const showInner = layer === 'all' || layer === 'inner'
  const showCasing = layer === 'all' || layer === 'casing'
  const showScent = layer === 'all' || layer === 'scent'
  const showWax = type.wax && (layer === 'all' || layer === 'wax')
  const showBubbles = type.bubbles && (layer === 'all' || layer === 'bubbles')

  // A happy wobble on every change.
  const changeKey = JSON.stringify(draft)
  const [bounce, setBounce] = useState(0)
  useEffect(() => setBounce((b) => b + 1), [changeKey])

  const speckles = useMemo(() => {
    const rand = seeded(spray.id + shape.id)
    return Array.from({ length: spray.count }, (_, i) => ({
      i,
      x: 30 + rand() * 200,
      y: 30 + rand() * 200,
      rot: rand() * 360,
      scale: spray.id === 'sticker' ? 1 : 1.3 + rand() * 0.9,
    }))
  }, [spray, shape])

  const clip = `url(#${uid}-shape)`
  const filled = fill !== undefined
  const shape3 = filled ? inflation(fill) : { scaleX: 1, scaleY: 1 }
  const origin = { transformBox: 'view-box', transformOrigin: '130px 236px' }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-10 -20 280 280"
      className="size-full overflow-visible"
      role="img"
      aria-label={`${shape.name} squishy with ${type.name.toLowerCase()} casing, ${spray.name.toLowerCase()} and ${scent.name.toLowerCase()} scent${draft.label ? `, printed with “${draft.label}”` : ''}`}
    >
      <defs>
        <clipPath id={`${uid}-shape`}>
          <ShapeParts parts={shape.parts} />
        </clipPath>
        {/* soft outline around the whole shape (union of parts) */}
        <filter id={`${uid}-outline`} x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="3" result="grown" />
          <feComposite in="grown" in2="SourceAlpha" operator="out" result="ring" />
          <feFlood floodColor={INK} floodOpacity="0.22" />
          <feComposite in2="ring" operator="in" />
        </filter>
        {/* glowing inner rim light */}
        <filter id={`${uid}-rim`} x="-10%" y="-10%" width="120%" height="120%">
          <feMorphology in="SourceAlpha" operator="erode" radius="5" result="shrunk" />
          <feComposite in="SourceAlpha" in2="shrunk" operator="out" result="ring" />
          <feGaussianBlur in="ring" stdDeviation="2.5" result="soft" />
          <feFlood floodColor="#fff" floodOpacity={type.rim} />
          <feComposite in2="soft" operator="in" />
        </filter>
        <pattern id={`${uid}-wax`} width="70" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 16q18 -7 35 0t35 0" fill="none" stroke="#fff" strokeWidth="5" opacity="0.35" />
          <path d="M10 6l6 3M48 20l5 -3" stroke="#8a6d00" strokeWidth="0.8" opacity="0.18" />
        </pattern>
        <radialGradient id={`${uid}-depth`} cx="42%" cy="36%" r="72%">
          <stop offset="0.5" stopColor={INK} stopOpacity="0" />
          <stop offset="1" stopColor={INK} stopOpacity="0.2" />
        </radialGradient>
      </defs>

      {/* floor shadow */}
      {layer === 'all' && <ellipse cx="130" cy="240" rx="88" ry="10" fill="#a3245f" opacity="0.12" />}

      {(showInner || showCasing || showWax || showBubbles) && (
        <motion.g initial={false} animate={shape3} transition={{ type: 'spring', stiffness: 220, damping: 14 }} style={origin}>
          <motion.g
            key={`jiggle-${jiggle}`}
            initial={false}
            animate={jiggle ? { scaleX: [1, 1.1, 0.94, 1.05, 1], scaleY: [1, 0.9, 1.06, 0.97, 1] } : {}}
            transition={{ duration: 0.6 }}
            style={origin}
          >
            <motion.g
              key={bounce}
              initial={still ? false : { scaleX: 1.06, scaleY: 0.94 }}
              animate={{ scaleX: 1, scaleY: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 7 }}
              style={origin}
            >
              {showCasing && (
                <>
                  <g filter={`url(#${uid}-outline)`}>
                    <ShapeParts parts={shape.parts} fill="#000" />
                  </g>
                  {shape.decor === 'tentacles' && <ShapeDecor decor="tentacles" color={color} />}
                  {shape.decor === 'gills' && <ShapeDecor decor="gills" />}
                </>
              )}

              <g clipPath={clip}>
                {showInner && (
                  <>
                    <rect x="-10" y="-20" width="280" height="280" fill="#fff" opacity="0.35" />
                    {filled && (
                      <FillingMass
                        draft={draft}
                        box={FILL_BOX}
                        top={FILL_BOX.y + FILL_BOX.h * (1 - Math.min(fill, 1))}
                        center={[130, 140]}
                        scatterTop={FILL_BOX.y + 24}
                        showAddons={layer === 'all'}
                      />
                    )}
                  </>
                )}
                {showCasing && (
                  <>
                    {/* the casing itself: how see-through depends on the casing type;
                        once filled, it reads a little clearer so the filling shows through */}
                    <rect x="-10" y="-20" width="280" height="280" fill={color} opacity={filled ? type.opacity * 0.75 : type.opacity} />

                    {/* spray */}
                    {speckles.map((p) =>
                      spray.id === 'sticker' ? (
                        <image
                          key={p.i}
                          href={stickerSrc(sticker)}
                          x={p.x - 22}
                          y={p.y - 22}
                          width="44"
                          height="44"
                          transform={`rotate(${(p.rot % 40) - 20} ${p.x} ${p.y})`}
                        />
                      ) : (
                        <g key={p.i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)}) scale(${p.scale.toFixed(2)})`}>
                          <SprayArt art={spray.art} index={p.i} />
                        </g>
                      ),
                    )}

                    {/* bubble wrap: each bubble leaves a flat, crinkly ring once popped */}
                    {type.bubbles &&
                      BUBBLES.map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r={BUBBLE_R - 1} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.45" />
                      ))}
                    {draft.label && <PrintedLabel text={draft.label} spot={labelSpot(shape)} />}

                    <rect x="-10" y="-20" width="280" height="280" fill={`url(#${uid}-depth)`} />
                    {/* gloss highlights: plastic is shiniest, balloon is softer */}
                    <ellipse cx="88" cy="74" rx="38" ry="15" fill="#fff" opacity={type.gloss * 0.7} transform="rotate(-28 88 74)" />
                    <circle cx="128" cy="58" r="6" fill="#fff" opacity={type.gloss * 0.8} />
                  </>
                )}
              </g>

              {showCasing && (
                <>
                  <g filter={`url(#${uid}-rim)`}>
                    <ShapeParts parts={shape.parts} fill="#000" />
                  </g>
                  {!['tentacles', 'gills'].includes(shape.decor) && <ShapeDecor decor={shape.decor} />}
                  {shape.face && <Face face={shape.face} />}
                  {draft.accessory && draft.accessory !== 'none' && <Accessory kind={draft.accessory} at={shape.attach} />}
                </>
              )}
              {showWax && (
                <g clipPath={clip}>
                  <rect x="-10" y="-20" width="280" height="280" fill={mix(color, '#fff7ea', 0.72)} opacity="0.86" />
                  <rect x="-10" y="-20" width="280" height="280" fill={`url(#${uid}-wax)`} />
                  <ellipse cx="92" cy="80" rx="34" ry="12" fill="#fff" opacity="0.35" transform="rotate(-28 92 80)" />
                </g>
              )}
              {showBubbles && (
                <g clipPath={clip}>
                  {BUBBLES.map(([x, y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r={BUBBLE_R} fill="#fff" opacity="0.28" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" />
                      <circle cx={x} cy={y + 2} r={BUBBLE_R - 2} fill={INK} opacity="0.05" />
                      <circle cx={x - 3} cy={y - 3} r="2.4" fill="#fff" opacity="0.9" />
                    </g>
                  ))}
                </g>
              )}
            </motion.g>
          </motion.g>
        </motion.g>
      )}

      {burst > 0 && !still && <SparkleBurst key={burst} />}

      {/* scent bubbles drifting up */}
      {showScent &&
        [[18, 200], [236, 180], [30, 90], [226, 70], [8, 150], [246, 130]].map(([x, y], i) => (
          <g key={`${scent.id}-${i}`} transform={`translate(${x} ${y})`}>
            <g className="scent-rise" style={{ animationDelay: `${i * 0.7}s` }}>
              <g transform="scale(1.3)">
                <ScentArt particle={scent.particle} color={scent.color} />
              </g>
            </g>
          </g>
        ))}
    </svg>
  )
}

// Stars flying outward when the squishy is full. Skipped with reduce motion.
function SparkleBurst() {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <g aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 12
        return (
          <motion.g
            key={i}
            initial={{ x: 130, y: 130, scale: 0.4, opacity: 1 }}
            animate={{ x: 130 + Math.cos(a) * 125, y: 130 + Math.sin(a) * 115, scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <SprayArt art={i % 2 ? 'star' : 'glitter'} index={i} />
          </motion.g>
        )
      })}
    </g>
  )
}
