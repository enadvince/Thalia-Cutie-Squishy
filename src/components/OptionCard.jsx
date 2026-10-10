import { motion } from 'framer-motion'
import { bouncy } from '../lib/motion'
import Icon from './Icon'

// A big tappable choice: artwork + short name. Picked = thick ring + check badge + tint,
// so being picked never relies on color alone.
export default function OptionCard({ label, selected, onClick, children }) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      transition={bouncy}
      onClick={onClick}
      className={`relative flex min-h-[7.5rem] flex-col items-center justify-center gap-1 rounded-[1.5rem] p-2 text-center
        shadow-[var(--shadow-soft)] ring-inset transition-colors
        ${selected ? 'bg-pink-100 ring-4 ring-ink' : 'bg-white ring-2 ring-transparent'}`}
    >
      {selected && <CheckBadge />}
      <span className="grid size-16 shrink-0 place-items-center">{children}</span>
      <span className="text-[length:var(--text-label)] leading-tight font-extrabold text-ink">{label}</span>
    </motion.button>
  )
}

export function CheckBadge() {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={bouncy}
      className="absolute -top-1.5 -right-1.5 z-10 grid size-8 place-items-center rounded-full bg-ink text-white shadow"
    >
      <Icon name="check" size={20} />
    </motion.span>
  )
}
