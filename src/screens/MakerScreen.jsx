import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { STEPS } from '../data/steps'
import { useGame } from '../state/GameContext'
import { usePlatform } from '../components/PlatformContext'
import { transitions } from '../lib/motion'
import { isStandalone } from '../lib/platform'
import { speak } from '../lib/speech'
import { tick } from '../lib/haptics'
import AppBar from '../components/AppBar'
import StepTabs from '../components/StepTabs'
import { IconButton, PrimaryButton } from '../components/Buttons'
import Icon from '../components/Icon'

// The 4-step maker shell. Step content plugs into the stage + panel slots in later phases.
export default function MakerScreen({ onGoToStep, onBack }) {
  const { state, dispatch } = useGame()
  const platform = usePlatform()
  const reduce = useReducedMotion()
  const { step, furthest, past } = state.maker
  const { readAloud, muted } = state.settings
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  // Read the instruction aloud when a step opens (Little Maker default).
  useEffect(() => {
    if (readAloud && !muted) speak(current.instruction)
  }, [current, readAloud, muted])

  // Slide direction follows step order.
  const prevStep = useRef(step)
  const direction = step >= prevStep.current ? 1 : -1
  useEffect(() => {
    prevStep.current = step
  }, [step])

  const swipe = useEdgeSwipeBack(platform === 'ios' && isStandalone(), onBack)

  return (
    <div className="flex min-h-dvh flex-col" {...swipe}>
      <AppBar title={current.title} onBack={onBack} backLabel={step === 0 ? 'Home' : STEPS[step - 1].label} />

      <StepTabs step={step} furthest={furthest} onSelect={onGoToStep} />

      <div className="flex items-center justify-center gap-3 px-[max(var(--gutter),env(safe-area-inset-left))] pt-4">
        <IconButton icon="speak" label="Read it to me" onClick={() => speak(current.instruction)} />
        <p className="font-display text-[length:var(--text-title)] font-semibold text-ink">{current.instruction}</p>
      </div>

      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.main
          key={current.id}
          custom={direction}
          initial={reduce ? { opacity: 0 } : { x: `${direction * 30}%`, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { x: `${direction * -30}%`, opacity: 0 }}
          transition={transitions[platform].page}
          className="grid flex-1 gap-4 p-[var(--gutter)] md:landscape:grid-cols-[1fr_minmax(20rem,40%)]"
        >
          {/* Stage: the live preview / play area (custom game look) */}
          <section
            aria-label="Squishy preview"
            className="grid min-h-64 place-items-center rounded-[var(--radius-card)] bg-white/60 shadow-[var(--shadow-soft)]"
          >
            <div className="flex flex-col items-center gap-2 p-6 text-center text-ink-soft">
              <Icon name={current.icon} size={88} />
              <p className="flex items-center gap-2 text-[length:var(--text-body)]">
                <Icon name="sparkle" size={22} filled /> Coming soon!
              </p>
            </div>
          </section>

          {/* Panel: option pickers arrive in Phases 2–3 */}
          <section aria-label="Choices" className="hidden md:landscape:block" />
        </motion.main>
      </AnimatePresence>

      <footer
        className="flex items-center justify-between gap-4 px-[max(var(--gutter),env(safe-area-inset-left))]
          pt-2 pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.75rem))]"
      >
        <IconButton
          icon="undo"
          label="Undo"
          disabled={past.length === 0}
          onClick={() => dispatch({ type: 'undo' })}
        />
        {!isLast && (
          <PrimaryButton
            icon="arrowNext"
            onClick={() => {
              tick()
              onGoToStep(step + 1)
            }}
          >
            Next
          </PrimaryButton>
        )}
      </footer>
    </div>
  )
}

// iOS home-screen apps have no system back swipe, so add one from the left edge.
// Safari in a browser tab already has it (and uses our history entries), so this only runs standalone.
function useEdgeSwipeBack(enabled, onBack) {
  const start = useRef(null)
  if (!enabled) return {}
  return {
    onPointerDown: (e) => {
      start.current = e.clientX < 24 ? { x: e.clientX, y: e.clientY } : null
    },
    onPointerUp: (e) => {
      const s = start.current
      start.current = null
      if (s && e.clientX - s.x > 80 && Math.abs(e.clientY - s.y) < 60) onBack()
    },
  }
}
