import { motion, useReducedMotion } from 'framer-motion'
import Mascot from '../components/Mascot'
import { MuteToggle } from '../components/AppBar'
import { PrimaryButton } from '../components/Buttons'
import { useGame } from '../state/GameContext'
import Icon from '../components/Icon'

export default function TitleScreen({ onPlay, onShelf }) {
  const reduce = useReducedMotion()
  const { stars } = useGame().state

  return (
    <main
      className="flex min-h-dvh flex-col
        px-[max(var(--gutter),env(safe-area-inset-left))]
        pt-[max(1rem,env(safe-area-inset-top))]
        pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          role="img"
          aria-label={`${stars} stars`}
          className="flex min-h-12 items-center gap-2 rounded-full bg-white/80 px-4 font-display text-[length:var(--text-title)]
            font-semibold text-ink shadow-[var(--shadow-soft)]"
        >
          <Icon name="star" size={26} filled className="text-[#8a6d00]" />
          {stars}
        </span>
        <MuteToggle />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4 text-center landscape:flex-row landscape:gap-10">
        <Mascot size={250} />

        <div className="flex flex-col items-center gap-6">
          <motion.h1
            initial={reduce ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="font-display text-[length:var(--text-hero)] leading-[1.05] font-bold text-pink-700
              [text-shadow:0_3px_0_#fff,0_6px_14px_rgba(163,36,95,0.25)]"
          >
            Thalia’s
            <br />
            Cutie Squishies
          </motion.h1>

          <PrimaryButton icon="play" onClick={onPlay}>
            Let’s make!
          </PrimaryButton>
          <button
            type="button"
            onClick={onShelf}
            className="flex min-h-[56px] items-center gap-2 rounded-full bg-white px-6 font-display text-[length:var(--text-title)]
              font-semibold text-ink shadow-[var(--shadow-soft)]"
          >
            <Icon name="shelf" size={28} /> My Shelf
          </button>
        </div>
      </div>
    </main>
  )
}
