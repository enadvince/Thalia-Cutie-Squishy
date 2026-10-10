import { motion, useAnimationControls } from 'framer-motion'
import { useGame } from '../state/GameContext'
import { pop } from '../lib/audio'
import { speak } from '../lib/speech'
import Icon from './Icon'

// Something that unlocks with stars: a big question mark (it's a surprise!), a lock,
// "Coming soon!" and how many stars it needs.
// Tapping it just wiggles (never an error).
export default function LockedCard({ name, stars }) {
  const { readAloud, muted } = useGame().state.settings
  const wiggle = useAnimationControls()
  return (
    <motion.button
      type="button"
      aria-disabled="true"
      aria-label={`${name}, locked. Coming soon! Unlocks at ${stars} stars.`}
      animate={wiggle}
      onClick={() => {
        pop(0.6)
        if (readAloud && !muted) speak('Coming soon!')
        wiggle.start({ rotate: [0, -6, 6, -4, 0], transition: { duration: 0.4 } })
      }}
      className="relative flex min-h-[7.5rem] flex-col items-center justify-center gap-1 rounded-[1.5rem] border-2 border-dashed
        border-ink-soft/40 bg-white/60 p-2 text-center"
    >
      <span className="absolute -top-1.5 -right-1.5 grid size-8 place-items-center rounded-full bg-lilac-300 text-ink shadow">
        <Icon name="lock" size={18} />
      </span>
      <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-lilac-100 font-display text-[2.75rem] leading-none font-bold text-lilac-700">
        ?
      </span>
      <span className="text-[length:var(--text-label)] leading-tight font-extrabold text-ink">Coming soon!</span>
      <span className="flex items-center gap-1 text-[length:var(--text-label)] font-extrabold text-ink-soft">
        <Icon name="star" size={18} filled /> {stars}
      </span>
    </motion.button>
  )
}
