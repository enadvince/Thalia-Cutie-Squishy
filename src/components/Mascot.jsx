import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { pop } from '../lib/audio'

// Glitter flecks suspended inside the jelly (fixed positions so it never flickers).
const GLITTER = [
  [70, 120, '#fff'], [92, 150, '#FFD84D'], [118, 112, '#fff'], [140, 160, '#A98BFF'],
  [160, 128, '#fff'], [182, 150, '#4FD1C5'], [100, 178, '#fff'], [150, 186, '#FFD84D'],
  [75, 160, '#A98BFF'], [190, 118, '#fff'], [128, 140, '#FFD84D'], [172, 178, '#fff'],
]

// The wobbling squishy mascot. Tap to squish it.
export default function Mascot({ size = 240 }) {
  const reduce = useReducedMotion()
  const [squish, setSquish] = useState(0)

  const idle = reduce
    ? {}
    : {
        scaleX: [1, 1.04, 0.98, 1.02, 1],
        scaleY: [1, 0.96, 1.03, 0.98, 1],
        transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
      }

  return (
    <motion.button
      type="button"
      aria-label="Squishy friend. Tap to squish!"
      onClick={() => {
        pop(0.8)
        setSquish((n) => n + 1)
      }}
      className="rounded-[40%] p-2"
      style={{ width: size, height: size * 0.92 }}
    >
      <motion.div
        key={squish}
        initial={squish && !reduce ? { scaleX: 1.25, scaleY: 0.72 } : false}
        animate={{ scaleX: 1, scaleY: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 7 }}
        style={{ originY: 1 }}
        className="size-full"
      >
        <motion.svg viewBox="0 0 256 236" className="size-full overflow-visible" animate={idle} style={{ originY: 1 }}>
          <defs>
            <radialGradient id="m-jelly" cx="40%" cy="35%" r="75%">
              <stop offset="0" stopColor="#FFE4F1" />
              <stop offset="0.55" stopColor="#FFB3D6" />
              <stop offset="1" stopColor="#FF7EB6" />
            </radialGradient>
            <radialGradient id="m-core" cx="50%" cy="60%" r="50%">
              <stop offset="0" stopColor="#D4BFFF" stopOpacity="0.7" />
              <stop offset="1" stopColor="#D4BFFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="m-rim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#9EEDE5" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* soft floor shadow */}
          <ellipse cx="128" cy="222" rx="92" ry="11" fill="#A3245F" opacity="0.12" />

          {/* jelly body (translucent) */}
          <path
            d="M24 160C24 88 70 30 128 30s104 58 104 130c0 40-46 60-104 60S24 200 24 160z"
            fill="url(#m-jelly)"
            fillOpacity="0.92"
          />
          <path d="M40 160c0-60 40-108 88-108s88 48 88 108c0 30-40 46-88 46s-88-16-88-46z" fill="url(#m-core)" />

          {/* glitter suspended inside */}
          {GLITTER.map(([x, y, c], i) => (
            <path
              key={i}
              d={`M${x} ${y - 4}l1.6 2.4 2.4 1.6-2.4 1.6-1.6 2.4-1.6-2.4-2.4-1.6 2.4-1.6z`}
              fill={c}
              opacity="0.9"
            />
          ))}

          {/* rim light */}
          <path
            d="M24 160C24 88 70 30 128 30s104 58 104 130c0 40-46 60-104 60S24 200 24 160z"
            fill="none"
            stroke="url(#m-rim)"
            strokeWidth="4"
          />

          {/* glossy highlights */}
          <ellipse cx="86" cy="72" rx="30" ry="13" fill="#fff" opacity="0.75" transform="rotate(-28 86 72)" />
          <circle cx="122" cy="52" r="6" fill="#fff" opacity="0.8" />

          {/* face */}
          <g>
            <ellipse cx="94" cy="142" rx="15" ry="18" fill="#3B2A4A" />
            <ellipse cx="162" cy="142" rx="15" ry="18" fill="#3B2A4A" />
            <circle cx="99" cy="134" r="6" fill="#fff" />
            <circle cx="167" cy="134" r="6" fill="#fff" />
            <circle cx="89" cy="150" r="2.6" fill="#fff" />
            <circle cx="157" cy="150" r="2.6" fill="#fff" />
            <ellipse cx="66" cy="168" rx="15" ry="8" fill="#FF7EB6" opacity="0.55" />
            <ellipse cx="190" cy="168" rx="15" ry="8" fill="#FF7EB6" opacity="0.55" />
            <path d="M118 166q10 10 20 0" fill="none" stroke="#3B2A4A" strokeWidth="5" strokeLinecap="round" />
          </g>
        </motion.svg>
      </motion.div>
    </motion.button>
  )
}
