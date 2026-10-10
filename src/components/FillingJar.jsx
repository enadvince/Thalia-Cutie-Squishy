import { useId } from 'react'
import { motion } from 'framer-motion'
import { fillingById } from '../data/fillings'
import { colorById } from '../data/colors'
import FillingMass from './FillingMass'
import { safeId } from '../lib/random'

// Jar geometry (viewBox 0 0 260 320)
const IN = { x: 44, y: 66, w: 172, h: 230, r: 36 } // glass interior
const FILL_TOP = 112

export default function FillingJar({ draft }) {
  const uid = safeId(useId())
  const filling = fillingById(draft.fillingType)
  const colors = draft.fillingColors.map(colorById)
  const changeKey = JSON.stringify(draft)

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
              <FillingMass draft={draft} box={IN} top={FILL_TOP} center={[130, 205]} />
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
