import { useEffect, useId, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { fillingById } from '../data/fillings'
import { colorById } from '../data/colors'
import { addonById } from '../data/addons'
import AddonArt from './AddonArt'
import { seeded, safeId } from '../lib/random'

// Archimedean spiral from (cx, cy) outwards, used for the color swirl.
function spiralPath(cx, cy, offset) {
  const pts = []
  for (let t = 0; t <= Math.PI * 5; t += 0.15) {
    const r = 4 + 9 * t
    pts.push(`${(cx + Math.cos(t + offset) * r).toFixed(1)},${(cy + Math.sin(t + offset) * r * 0.8).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}

const BIG_ART = new Set(['cloudPuppy', 'bowKitty', 'bunnyImp', 'pinkLamb', 'sunnyPup', 'pompom'])

// How many add-on pieces float in a squishy in total, however many add-ons she picks.
export const MAX_PIECES = 54
const VARIATION = 0.05 // each add-on's share wobbles by up to ±5 percentage points

// Splits 100% between the picked add-ons: an equal share each ± 5%, and the last one gets
// whatever is left. Seeded by the combination, so the same picks always look the same.
export function addonShares(addons) {
  const n = addons.length
  const rand = seeded(addons.join('|'))
  const shares = []
  let left = 1
  for (let i = 0; i < n - 1; i++) {
    const share = Math.min(Math.max(1 / n + (rand() * 2 - 1) * VARIATION, 0.02), left - 0.02 * (n - 1 - i))
    shares.push(share)
    left -= share
  }
  if (n) shares.push(left)
  return shares
}

// Where each add-on piece floats inside `box` (stable for the same add-ons). Also used by Step 4's canvas.
export function addonPieces(addons, box, scatterTop) {
  const bottom = box.y + box.h
  const shares = addonShares(addons)
  return addons.flatMap((id, k) => {
    const addon = addonById(id)
    if (!addon) return []
    const rand = seeded(id)
    return Array.from({ length: Math.max(1, Math.round(shares[k] * MAX_PIECES)) }, (_, i) => ({
      key: `${id}-${i}`,
      art: addon.art,
      index: i,
      x: box.x + 22 + rand() * (box.w - 44),
      y: scatterTop + rand() * (bottom - scatterTop - 20),
      rot: rand() * 60 - 30,
      scale: BIG_ART.has(addon.art) ? 1.3 : 1.1,
      delay: rand() * 3,
    }))
  })
}

// The filling itself: colors swirled together, the filling type's texture and shine, and add-ons
// suspended inside. Fills `box` from `top` (the wavy surface) down. The caller clips it to its container.
// Add-ons are scattered from `scatterTop` down and only show once the surface is above them.
export default function FillingMass({ draft, box, top, center, scatterTop = top + 26, showAddons = true }) {
  const uid = safeId(useId())
  const filling = fillingById(draft.fillingType)
  const [base, ...swirls] = draft.fillingColors.map(colorById)
  const { gloss, pattern } = filling.texture
  const [cx, cy] = center
  const origin = `${cx}px ${cy}px`
  const bottom = box.y + box.h

  // Every change gives the swirl a turn.
  const changeKey = JSON.stringify(draft)
  const [turns, setTurns] = useState(0)
  useEffect(() => setTurns((t) => t + 1), [changeKey])

  // Up to 3 swirl ribbons over the base color (4 colors in all), evenly spaced around the spiral.
  const spirals = useMemo(() => {
    const n = Math.max(1, swirls.length)
    return Array.from({ length: n }, (_, i) => spiralPath(cx, cy, (i * 2 * Math.PI) / n))
  }, [cx, cy, swirls.length])

  const pieces = useMemo(() => addonPieces(draft.addons, box, scatterTop), [draft.addons, box, scatterTop])

  const left = box.x - 30
  const width = box.w + 60
  const waves = Array.from({ length: Math.ceil(width / 43) }, () => 't43 0').join(' ')

  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={base.hex} stopOpacity="0.85" />
          <stop offset="1" stopColor={base.hex} />
        </linearGradient>
        <radialGradient id={`${uid}-depth`} cx="45%" cy="40%" r="70%">
          <stop offset="0.55" stopColor="#3b2a4a" stopOpacity="0" />
          <stop offset="1" stopColor="#3b2a4a" stopOpacity="0.22" />
        </radialGradient>
        <clipPath id={`${uid}-body`}>
          <rect x={left} y={top} width={width} height={bottom - top + 10} />
        </clipPath>
        <pattern id={`${uid}-beads`} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2.6" fill="#fff" opacity="0.6" />
          <circle cx="10" cy="10" r="2" fill="#fff" opacity="0.5" />
          <circle cx="10.5" cy="11" r="2" fill="#3b2a4a" opacity="0.08" />
        </pattern>
        <pattern id={`${uid}-pores`} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#fff" opacity="0.14" />
          <circle cx="2" cy="3" r="1" fill="#3b2a4a" opacity="0.12" />
          <circle cx="7" cy="8" r="0.8" fill="#3b2a4a" opacity="0.1" />
        </pattern>
        <pattern id={`${uid}-grain`} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.5" fill="#3b2a4a" opacity="0.1" />
          <circle cx="3" cy="2.6" r="0.45" fill="#fff" opacity="0.35" />
        </pattern>
        <pattern id={`${uid}-cream`} width="60" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 11q15 -8 30 0t30 0" fill="none" stroke="#fff" strokeWidth="3" opacity="0.35" />
        </pattern>
        <pattern id={`${uid}-flakes`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M2 3l3-1 1 3-3 1zM10 9l4 1-1 3-3-1zM4 12l2-1 1 2-2 1z" fill="#fff8d6" opacity="0.75" />
          <path d="M11 3l2 0 0 2z" fill="#8a6d00" opacity="0.2" />
        </pattern>
        <pattern id={`${uid}-foam`} width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="#fff" opacity="0.22" />
          <circle cx="4" cy="5" r="3" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
          <circle cx="13" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
          <circle cx="12" cy="3" r="1.5" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.6" />
        </pattern>
        <pattern id={`${uid}-sugar`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect x="1" y="1" width="1.4" height="1.4" fill="#fff" opacity="0.7" />
          <rect x="4" y="3.5" width="1.2" height="1.2" fill="#fff" opacity="0.55" />
        </pattern>
        <pattern id={`${uid}-wax`} width="44" height="44" patternUnits="userSpaceOnUse">
          {/* solid candle wax: soft marbling inside, no surface haze */}
          <path d="M-4 30q12 -14 26 -4t26 -2" fill="none" stroke="#3b2a4a" strokeWidth="1.2" opacity="0.07" />
          <path d="M6 10q10 6 20 0t22 2" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.18" />
        </pattern>
        <pattern id={`${uid}-orbs`} width="22" height="20" patternUnits="userSpaceOnUse">
          {/* water beads: plump see-through spheres with a glint */}
          {[[6, 6, 5.2], [17, 9, 5], [10, 16, 4.8], [0, 16, 4.6], [22, 16, 4.6]].map(([cx, cy, r], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="#fff" opacity="0.18" stroke="#3b2a4a" strokeOpacity="0.12" strokeWidth="0.7" />
              <circle cx={cx - r * 0.35} cy={cy - r * 0.4} r={r * 0.28} fill="#fff" opacity="0.75" />
            </g>
          ))}
        </pattern>
        <pattern id={`${uid}-folds`} width="50" height="40" patternUnits="userSpaceOnUse">
          <path d="M5 30q20 -26 40 0" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.35" />
        </pattern>
      </defs>

      <path d={`M${left} ${top} q21.5 -10 43 0 ${waves} V${bottom + 10} H${left} Z`} fill={`url(#${uid}-base)`} />
      <g clipPath={`url(#${uid}-body)`}>
        <g className="slow-spin" style={{ transformBox: 'view-box', transformOrigin: origin }}>
          <motion.g
            animate={{ rotate: turns * 75 }}
            transition={{ type: 'spring', stiffness: 40, damping: 12 }}
            style={{ transformBox: 'view-box', transformOrigin: origin }}
          >
            {(swirls.length ? swirls : [null]).map((c, i) => (
              <path
                key={i}
                d={spirals[i]}
                fill="none"
                stroke={c ? c.hex : '#fff'}
                strokeOpacity={c ? 0.95 : 0.3}
                strokeWidth={swirls.length >= 3 ? 11 : 15}
                strokeLinecap="round"
              />
            ))}
          </motion.g>
        </g>
        <rect x={left} y={top - 12} width={width} height={bottom - top + 22} fill={`url(#${uid}-depth)`} />
        {pattern !== 'none' && (
          <rect x={left} y={top - 12} width={width} height={bottom - top + 22} fill={`url(#${uid}-${pattern})`} />
        )}
      </g>

      {/* add-ons suspended in the filling (only the ones the surface has reached) */}
      {showAddons &&
        pieces
        .filter((p) => p.y > top + 10)
        .map((p) => (
          <g key={p.key} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)})`}>
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: p.scale }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            >
              <g className="float-bob" style={{ animationDelay: `${p.delay}s` }}>
                <AddonArt art={p.art} index={p.index} />
              </g>
            </motion.g>
          </g>
        ))}

      {/* surface shine: wet fillings shine more */}
      <ellipse cx={box.x + 52} cy={top + 26} rx="34" ry="9" fill="#fff" opacity={gloss * 0.75} />
      <rect x={box.x + 14} y={top + 50} width="9" height={Math.max(0, Math.min(110, bottom - top - 70))} rx="4.5" fill="#fff" opacity={gloss * 0.5} />
    </g>
  )
}
