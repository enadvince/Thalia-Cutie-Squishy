import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGame } from '../state/GameContext'
import { speak } from '../lib/speech'
import Mascot from '../components/Mascot'
import { MuteToggle } from '../components/AppBar'
import ParentGate from '../components/ParentGate'
import Icon from '../components/Icon'
import { useModal } from '../lib/useModal'

// The gentle playtime reminder: covers everything until a grown-up adds more time. Everything is autosaved.
export default function NapScreen({ onMoreTime }) {
  const { readAloud, muted } = useGame().state.settings
  const titleId = useId()
  const [gate, setGate] = useState(false)
  const ref = useRef(null)
  useModal(ref)

  useEffect(() => {
    if (readAloud && !muted) speak('Your squishies need a nap! See you soon!')
    // Only when the nap starts.
  }, [])

  return createPortal(
    <div
      ref={ref}
      tabIndex={-1}
      inert={gate || undefined} // while the parent gate is open on top
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[55] flex flex-col outline-none overflow-y-auto bg-gradient-to-b from-lilac-300 via-[#e9ddff] to-cream
        px-[max(var(--gutter),env(safe-area-inset-left))] pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex justify-end">
        <MuteToggle />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-4 text-center landscape:flex-row landscape:gap-10">
        <Mascot size={220} sleeping />
        <div className="flex flex-col items-center gap-3">
          <h1 id={titleId} className="font-display text-[length:var(--text-hero)] leading-[1.05] font-bold text-ink">
            Your squishies need a nap!
          </h1>
          <p className="flex items-center gap-2 text-[length:var(--text-body)] text-ink">
            <Icon name="heart" size={24} filled /> Everything is saved. See you soon!
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setGate(true)}
        className="flex min-h-[56px] items-center gap-2 self-center rounded-full bg-white/80 px-5 text-[length:var(--text-label)] font-bold text-ink shadow-[var(--shadow-soft)]"
      >
        <Icon name="lock" size={20} /> Grown-ups: more time
      </button>
      {gate && (
        <ParentGate
          onCancel={() => setGate(false)}
          onPass={() => {
            setGate(false)
            onMoreTime()
          }}
        />
      )}
    </div>,
    document.body,
  )
}
