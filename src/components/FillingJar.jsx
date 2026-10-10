import { useEffect, useId, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { fillingById } from '../data/fillings'
import { colorById } from '../data/colors'
import { addonById } from '../data/addons'
import AddonArt from './AddonArt'

// Jar geometry (viewBox 0 0 260 320)
const IN = { x: 44, y: 66, w: 172, h: 230, r: 36 } // glass interior
const FILL_TOP = 112
const SWIRL_CENTER = '130px 205px'

// Archimedean spiral from the jar's center outwards, used for the color swirl.
function spiralPath(offset) {
  const pts = []
  for (let t = 0; t <= Math.PI * 5; t += 0.15) {
    const r = 4 + 9 * t
    pts.push(`${(130 + Math.cos(t + offset) * r).toFixed(1)},${(205 + Math.sin(t + offset) * r * 0.8).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}
const SPIRALS = [spiralPath(0), spiralPath(Math.PI)]

// Small deterministic random so add-ons stay put between renders.
function seeded(str) {
  let h = 2166136261
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h >>>= 0) % 10000) / 10000
  }
}

const BIG_ART = new Set(['cloudPuppy', 'bowKitty', 'bunnyImp', 'pinkLamb', 'sunnyPup', 'pompom'])

export default function FillingJar({ draft }) {
  const uid = useId().replace(/:/g, '')
  const filling = fillingById(draft.fillingType)
  const colors = draft.fillingColors.map(colorById)
  const [base, ...swirls] = colors
  const { gloss, pattern } = filling.texture

  // Every change gives the swirl a turn and the jar a happy wobble.
  const changeKey = JSON.stringify(draft)
  const [turns, setTurns] = useState(0)
  useEffect(() => setTurns((t) => t + 1), [changeKey])

  const pieces = useMemo(() => {
    return draft.addons.flatMap((id) => {
      const addon = addonById(id)
      if (!addon) return []
      const rand = seeded(id)
      return Array.from({ length: addon.count }, (_, i) => ({
        key: `${id}-${i}`,
        art: addon.art,
        index: i,
        x: IN.x + 22 + rand() * (IN.w - 44),
        y: FILL_TOP + 26 + rand() * (IN.y + IN.h - FILL_TOP - 46),
        rot: rand() * 60 - 30,
        scale: BIG_ART.has(addon.art) ? 1.5 : 1.2,
        delay: rand() * 3,
      }))
    })
  }, [draft.addons])

  return (
    <figure className="m-0 size-full">
      <motion.svg
        viewBox="0 0 260 320"
        className="size-full"
        role="img"
        aria-label={`Jar of ${colors.map((c) => c.name).join(' and ')} ${filling.name}`}
      >
        <defs>
          <clipPath id={`${uid}-in`}>
            <rect x={IN.x} y={IN.y} width={IN.w} height={IN.h} rx={IN.r} />
          </clipPath>
          <linearGradient id={`${uid}-base`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={base.hex} stopOpacity="0.85" />
            <stop offset="1" stopColor={base.hex} />
          </linearGradient>
          <radialGradient id={`${uid}-depth`} cx="45%" cy="40%" r="70%">
            <stop offset="0.55" stopColor="#3b2a4a" stopOpacity="0" />
            <stop offset="1" stopColor="#3b2a4a" stopOpacity="0.22" />
          </radialGradient>
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
          <pattern id={`${uid}-folds`} width="50" height="40" patternUnits="userSpaceOnUse">
            <path d="M5 30q20 -26 40 0" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.35" />
          </pattern>
        </defs>

        {/* lid */}
        <rect x="62" y="12" width="136" height="36" rx="13" fill="#d4bfff" />
        <rect x="62" y="12" width="136" height="12" rx="6" fill="#fff" opacity="0.35" />
        {[84, 108, 132, 156, 180].map((x) => (
          <rect key={x} x={x - 2} y="16" width="4" height="28" rx="2" fill="#a98bff" opacity="0.5" />
        ))}

        <motion.g
          key={changeKey}
          initial={{ scaleX: 1.04, scaleY: 0.96 }}
          animate={{ scaleX: 1, scaleY: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 8 }}
          style={{ transformBox: 'view-box', transformOrigin: '130px 306px' }}
        >
          {/* glass back */}
          <rect x="34" y="52" width="192" height="254" rx="46" fill="#fff" opacity="0.45" />

          {/* the filling */}
          <g clipPath={`url(#${uid}-in)`}>
            <motion.g
              key={filling.id}
              initial={{ y: 190 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 90, damping: 14 }}
            >
              <path
                d={`M0 ${FILL_TOP} q21.5 -10 43 0 t43 0 t43 0 t43 0 t43 0 t43 0 V320 H0 Z`}
                fill={`url(#${uid}-base)`}
              />
              <g>
                <g className="slow-spin" style={{ transformBox: 'view-box', transformOrigin: SWIRL_CENTER }}>
                  <motion.g
                    animate={{ rotate: turns * 75 }}
                    transition={{ type: 'spring', stiffness: 40, damping: 12 }}
                    style={{ transformBox: 'view-box', transformOrigin: SWIRL_CENTER }}
                  >
                    {(swirls.length ? swirls : [null]).map((c, i) => (
                      <path
                        key={i}
                        d={SPIRALS[i]}
                        fill="none"
                        stroke={c ? c.hex : '#fff'}
                        strokeOpacity={c ? 0.95 : 0.3}
                        strokeWidth="15"
                        strokeLinecap="round"
                      />
                    ))}
                  </motion.g>
                </g>
                <rect x="0" y={FILL_TOP - 12} width="260" height="220" fill={`url(#${uid}-depth)`} />
                {pattern !== 'none' && (
                  <rect x="0" y={FILL_TOP - 12} width="260" height="220" fill={`url(#${uid}-${pattern})`} />
                )}
              </g>

              {/* add-ons suspended in the filling */}
              {pieces.map((p) => (
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
              <ellipse cx="96" cy={FILL_TOP + 26} rx="34" ry="9" fill="#fff" opacity={gloss * 0.75} />
              <rect x="58" y={FILL_TOP + 50} width="9" height="110" rx="4.5" fill="#fff" opacity={gloss * 0.5} />
            </motion.g>
          </g>

          {/* glass front: rim light, outline and highlights */}
          <rect x="34" y="52" width="192" height="254" rx="46" fill="none" stroke="#fff" strokeWidth="5" opacity="0.9" />
          <rect x="34" y="52" width="192" height="254" rx="46" fill="none" stroke="#3b2a4a" strokeWidth="2" opacity="0.18" />
          <rect x="50" y="78" width="12" height="150" rx="6" fill="#fff" opacity="0.55" />
          <rect x="198" y="96" width="7" height="60" rx="3.5" fill="#fff" opacity="0.4" />
        </motion.g>
      </motion.svg>
    </figure>
  )
}
