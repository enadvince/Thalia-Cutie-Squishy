import { LayoutGroup, motion } from 'framer-motion'
import { STEPS } from '../data/steps'
import { transitions } from '../lib/motion'
import { usePlatform } from './PlatformContext'
import Icon from './Icon'

// 4-step stepper. Adapted from Watermelon UI "Continuous Tabs" (sliding spring pill),
// converted to JSX and re-skinned in candy colors. Icon + label on every step.
// Steps up to the furthest one reached can be tapped; later ones are visibly not ready yet.
export default function StepTabs({ step, furthest, onSelect }) {
  const platform = usePlatform()

  return (
    <LayoutGroup>
      <nav aria-label="Squishy steps" className="px-[max(var(--gutter),env(safe-area-inset-left))] pt-3">
        <ol className="flex gap-1 rounded-full bg-white/70 p-1.5 shadow-[var(--shadow-candy)]">
          {STEPS.map((s, i) => {
            const active = i === step
            const reachable = i <= furthest
            return (
              <li key={s.id} className="fit-item min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => reachable && onSelect(i)}
                  aria-current={active ? 'step' : undefined}
                  aria-disabled={!reachable || undefined}
                  aria-label={`Step ${i + 1}: ${s.label}${reachable ? '' : ', not yet'}`}
                  className={`relative flex min-h-14 w-full flex-col items-center justify-center rounded-full px-1 py-1.5
                    ${reachable ? '' : 'opacity-50'}`}
                >
                  {active && (
                    <motion.span
                      layoutId="step-pill"
                      transition={transitions[platform].pill}
                      className="absolute inset-0 rounded-full bg-pink-300"
                    />
                  )}
                  <span className="relative flex flex-col items-center leading-tight">
                    <Icon name={s.icon} size={26} />
                    <span className="fit-label text-[length:var(--text-label)] font-extrabold">{s.label}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
    </LayoutGroup>
  )
}
