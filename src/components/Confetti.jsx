import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const COLORS = ['#ff7eb6', '#a98bff', '#4fd1c5', '#ffd84d', '#ffb3d6', '#9eede5']

// Gentle candy confetti that drifts down once. No flashing. Skipped entirely with reduce motion.
export default function Confetti() {
  const reduce = useReducedMotion()
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        drift: Math.random() * 30 - 15,
        delay: Math.random() * 0.35,
        duration: 1.6 + Math.random() * 0.8,
        spin: Math.random() * 540 - 270,
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [],
  )
  if (reduce) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: '-5vh', x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: '105vh', x: `${p.drift}vw`, rotate: p.spin, opacity: [1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.3, 0, 0.7, 1] }}
          className={`absolute top-0 block ${p.round ? 'size-3 rounded-full' : 'h-4 w-2 rounded-sm'}`}
          style={{ left: `${p.x}%`, background: p.color }}
        />
      ))}
    </div>
  )
}
