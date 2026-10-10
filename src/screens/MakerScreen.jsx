import { Fragment, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { STEPS } from '../data/steps'
import { useGame } from '../state/GameContext'
import { usePlatform } from '../components/PlatformContext'
import { transitions } from '../lib/motion'
import { isStandalone } from '../lib/platform'
import { speak } from '../lib/speech'
import { tick } from '../lib/haptics'
import { jingle } from '../lib/audio'
import AppBar from '../components/AppBar'
import StepTabs from '../components/StepTabs'
import { IconButton, PrimaryButton } from '../components/Buttons'
import Icon from '../components/Icon'
import Confetti from '../components/Confetti'
import FillingJar from '../components/FillingJar'
import FillingPanel, { FILLING_SECTIONS } from '../steps/FillingPanel'
import SquishyView from '../components/SquishyView'
import CasingPanel, { CASING_SECTIONS } from '../steps/CasingPanel'
import { FillProvider, FillStage, FillPanel } from '../steps/FillStep'
import { PlayProvider, PlayStage, PlayPanel } from '../steps/PlayStep'

// What each step shows: Stage = live preview (custom game look), Panel = pickers (platform sheet).
// Steps without a view yet show a "Coming soon!" placeholder.
const STEP_VIEWS = {
  filling: { Stage: FillingJar, Panel: FillingPanel, sections: FILLING_SECTIONS },
  casing: { Stage: SquishyView, Panel: CasingPanel, sections: CASING_SECTIONS },
  fill: { Stage: FillStage, Panel: FillPanel, Provider: FillProvider },
  play: { Stage: PlayStage, Panel: PlayPanel, Provider: PlayProvider, tallStage: true },
}

// The 4-step maker shell.
export default function MakerScreen({ onGoToStep, onBack }) {
  const { state, dispatch } = useGame()
  const platform = usePlatform()
  const reduce = useReducedMotion()
  const { step, furthest, past, draft } = state.maker
  const { readAloud, muted } = state.settings
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const view = STEP_VIEWS[current.id]
  const StepProvider = view?.Provider ?? Fragment // shares live state between a step's Stage and Panel

  // Some steps have sections (e.g. Type / Colors / Add-ons), each with its own instruction.
  const [sectionByStep, setSectionByStep] = useState({})
  const section = sectionByStep[current.id] ?? view?.sections?.[0].id
  const instruction = view?.sections?.find((s) => s.id === section)?.instruction ?? current.instruction

  // Read the instruction aloud when it changes (Little Maker default).
  useEffect(() => {
    if (readAloud && !muted) speak(instruction)
  }, [instruction, readAloud, muted])

  const [party, setParty] = useState(0)

  // Slide direction follows step order.
  const prevStep = useRef(step)
  const direction = step >= prevStep.current ? 1 : -1
  useEffect(() => {
    prevStep.current = step
  }, [step])

  const swipe = useEdgeSwipeBack(platform === 'ios' && isStandalone(), onBack)

  return (
    // Fixed-height app layout; if huge text makes it overflow, the whole screen scrolls instead.
    <div className="flex h-dvh flex-col overflow-y-auto" {...swipe}>
      {party > 0 && <Confetti key={party} />}
      <AppBar title={current.title} onBack={onBack} backLabel={step === 0 ? 'Home' : STEPS[step - 1].label} />

      <StepTabs step={step} furthest={furthest} onSelect={onGoToStep} />

      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.main
          key={current.id}
          custom={direction}
          initial={reduce ? { opacity: 0 } : { x: `${direction * 30}%`, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { x: `${direction * -30}%`, opacity: 0 }}
          transition={transitions[platform].page}
          className="flex min-h-[360px] flex-1 flex-col gap-3 px-[max(var(--gutter),env(safe-area-inset-left))] pt-3
            md:landscape:grid md:landscape:grid-cols-[1fr_minmax(22rem,42%)] md:landscape:gap-5"
        >
          <StepProvider>
          <section
            aria-label="Squishy preview"
            className={`flex ${view?.tallStage ? 'h-[62%]' : 'h-[46%]'} min-h-[210px] shrink-0 flex-col rounded-[var(--radius-card)] bg-white/60 p-2
              shadow-[var(--shadow-soft)] md:landscape:h-auto`}
          >
            <div className="flex items-center gap-2">
              <IconButton icon="speak" label="Read it to me" onClick={() => speak(instruction)} />
              <p className="font-display text-[length:var(--text-title)] leading-tight font-semibold text-ink">{instruction}</p>
            </div>
            {/* the preview fills whatever height is left */}
            <div className="relative min-h-0 flex-1">
              {view ? (
                <div className="absolute inset-0">
                  <view.Stage draft={draft} />
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-ink-soft">
                  <Icon name={current.icon} size={88} />
                  <p className="flex items-center gap-2 text-[length:var(--text-body)]">
                    <Icon name="sparkle" size={22} filled /> Coming soon!
                  </p>
                </div>
              )}
            </div>
          </section>

          {view && (
            <section
              aria-label="Choices"
              className={`min-h-[180px] flex-1 overflow-y-auto p-3 pb-28 scroll-pb-28 md:landscape:rounded-[var(--radius-card)] ${
                platform === 'ios'
                  ? 'rounded-t-[1.75rem] bg-white/85 backdrop-blur-xl'
                  : 'rounded-t-[28px] bg-[var(--md-sys-color-surface-container)]'
              }`}
            >
              <view.Panel
                section={section}
                onSection={(id) => setSectionByStep((m) => ({ ...m, [current.id]: id }))}
                onGoToStep={onGoToStep}
              />
            </section>
          )}
          </StepProvider>
        </motion.main>
      </AnimatePresence>

      <footer
        className="sticky bottom-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-t from-cream via-cream/90
          px-[max(var(--gutter),env(safe-area-inset-left))] pt-2 pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))]"
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
              jingle()
              setParty((n) => n + 1)
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
