import { usePlatform } from './PlatformContext'
import { useGame } from '../state/GameContext'
import { IconButton } from './Buttons'
import Icon from './Icon'

// Always-visible mute toggle (guardrail).
export function MuteToggle() {
  const { state, dispatch } = useGame()
  const muted = state.settings.muted
  return (
    <IconButton
      icon={muted ? 'soundOff' : 'soundOn'}
      label={muted ? 'Sound off. Tap to turn on' : 'Sound on. Tap to turn off'}
      pressed={muted}
      onClick={() => dispatch({ type: 'setSetting', key: 'muted', value: !muted })}
    />
  )
}

// Platform-adaptive top bar.
// iOS: HIG navigation bar (centered title, chevron + back label, translucent material).
// Android: M3 small top app bar (leading arrow icon button, start-aligned title).
export default function AppBar({ title, onBack, backLabel = 'Back' }) {
  const platform = usePlatform()
  const pad = 'px-[max(var(--gutter),env(safe-area-inset-left))] pt-[max(0.5rem,env(safe-area-inset-top))] pb-2'

  if (platform === 'ios') {
    return (
      <header
        className={`ios-navbar chrome-font sticky top-0 z-20 grid grid-cols-[minmax(56px,1fr)_minmax(0,auto)_minmax(56px,1fr)] items-center gap-2 border-b
          border-[var(--ios-separator)] bg-[var(--ios-bar-bg)] backdrop-blur-xl ${pad}`}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label={`Back to ${backLabel}`}
          className="-ml-2 flex min-h-[56px] min-w-[56px] items-center gap-1 justify-self-start pr-2 text-[var(--ios-tint)]"
        >
          <Icon name="chevronBack" size={30} />
          <span className="ios-back-label max-w-[28vw] truncate text-[length:var(--text-body)]">{backLabel}</span>
        </button>
        <h1 className="truncate text-center text-[length:var(--text-body)] font-semibold">{title}</h1>
        <div className="justify-self-end">
          <MuteToggle />
        </div>
      </header>
    )
  }

  return (
    <header
      className={`chrome-font sticky top-0 z-20 flex min-h-16 items-center gap-2 bg-[var(--md-sys-color-surface)] ${pad}`}
    >
      <IconButton icon="arrowBack" label={`Back to ${backLabel}`} onClick={onBack} className="bg-transparent shadow-none" />
      <h1 className="min-w-0 flex-1 truncate text-[length:var(--text-title)] font-normal text-[var(--md-sys-color-on-surface)]">
        {title}
      </h1>
      <MuteToggle />
    </header>
  )
}
