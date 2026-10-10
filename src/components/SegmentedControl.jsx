import { LayoutGroup, motion } from 'framer-motion'
import { usePlatform } from './PlatformContext'
import { transitions } from '../lib/motion'
import { pop } from '../lib/audio'
import Icon from './Icon'

// Switches between sections of a step (e.g. Type / Colors / Add-ons).
// iOS: HIG segmented control (grey track, white sliding thumb).
// Android: M3 segmented buttons (outlined, selected segment filled with a check).
export default function SegmentedControl({ label, items, value, onChange }) {
  const platform = usePlatform()
  const ios = platform === 'ios'

  return (
    <LayoutGroup id={label}>
      <div
        role="tablist"
        aria-label={label}
        className={`chrome-font flex flex-wrap ${
          ios
            ? 'gap-1 rounded-[1.25rem] bg-[rgba(118,118,128,0.14)] p-1'
            : 'overflow-hidden rounded-[28px] border border-[var(--md-sys-color-outline)]'
        }`}
      >
        {items.map((item, i) => {
          const selected = item.id === value
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={item.label}
              onClick={() => {
                if (selected) return
                pop(1.2)
                onChange(item.id)
              }}
              className={`fit-item relative flex min-h-[56px] min-w-[56px] flex-1 items-center justify-center px-1 py-1
                text-[length:var(--text-label)] font-semibold text-ink
                ${ios ? 'rounded-[1rem]' : i > 0 ? 'border-l border-[var(--md-sys-color-outline)]' : ''}`}
            >
              {selected && (
                <motion.span
                  layoutId="segment-thumb"
                  transition={transitions[platform].pill}
                  className={`absolute inset-0 ${
                    ios
                      ? 'rounded-[1rem] bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)]'
                      : 'bg-[var(--md-sys-color-secondary-container)]'
                  }`}
                />
              )}
              <span className="relative flex min-w-0 flex-col items-center leading-tight">
                {!ios && selected ? <Icon name="check" size={22} /> : <Icon name={item.icon} size={24} />}
                <span className="fit-label truncate">{item.label}</span>
              </span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
