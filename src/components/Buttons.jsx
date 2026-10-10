import { motion } from 'framer-motion'
import { usePlatform } from './PlatformContext'
import { bouncy } from '../lib/motion'
import { pop } from '../lib/audio'
import Icon from './Icon'

// Round icon button: 56px default target (exceeds 44pt / 48dp). Always has an aria-label.
export function IconButton({ icon, label, onClick, disabled = false, pressed, className = '' }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={`grid size-[56px] shrink-0 place-items-center rounded-full
        bg-white/70 text-ink shadow-[var(--shadow-soft)] transition-opacity
        ${disabled ? 'opacity-45' : 'active:scale-95'} ${className}`}
    >
      <Icon name={icon} />
    </button>
  )
}

// The main "go" action. iOS: large filled capsule button. Android: M3 extended FAB.
export function PrimaryButton({ icon, children, onClick, className = '' }) {
  const platform = usePlatform()
  const shape =
    platform === 'android'
      ? 'rounded-[var(--radius-m3-fab)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
      : 'rounded-full bg-[var(--ios-fill)] text-ink'

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      transition={bouncy}
      onClick={() => {
        pop()
        onClick?.()
      }}
      className={`inline-flex min-h-16 min-w-16 items-center justify-center gap-3 px-7 py-3
        font-display text-[length:var(--text-title)] font-semibold shadow-[var(--shadow-candy)] ${shape} ${className}`}
    >
      {children}
      {icon && <Icon name={icon} size={30} filled={icon === 'play'} />}
    </motion.button>
  )
}
