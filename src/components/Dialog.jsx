import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { usePlatform } from './PlatformContext'

// Platform alert/dialog. iOS: HIG alert (centered, side-by-side buttons, bold safe choice).
// Android: M3 dialog (28dp corners, start-aligned title, text buttons at the end).
// actions: [{ label, onClick, destructive?, primary? }]; the primary (safe) action gets focus.
export default function Dialog({ title, message, actions, onDismiss, children }) {
  const ios = usePlatform() === 'ios'
  const titleId = useId()
  const messageId = useId()
  const primaryRef = useRef(null)

  useEffect(() => {
    primaryRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onDismiss?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-[var(--gutter)]">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/35"
        onClick={onDismiss}
      />
      <motion.div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={`chrome-font relative w-full max-w-sm shadow-[0_12px_40px_rgba(59,42,74,0.25)] ${
          ios ? 'rounded-[1.25rem] bg-cream/95 text-center backdrop-blur-xl' : 'rounded-[28px] bg-[var(--md-sys-color-surface-container)] p-6'
        }`}
      >
        <div className={ios ? 'px-5 pt-5 pb-4' : ''}>
          {children}
          <h2 id={titleId} className={`font-semibold text-ink ${ios ? 'text-[length:var(--text-body)]' : 'text-[length:var(--text-title)] font-normal'}`}>
            {title}
          </h2>
          {message && (
            <p id={messageId} className="mt-2 text-[length:var(--text-label)] text-ink-soft">
              {message}
            </p>
          )}
        </div>
        <div className={ios ? 'flex flex-wrap border-t border-[var(--ios-separator)]' : 'mt-4 flex flex-wrap justify-end gap-2'}>
          {actions.map((a) => (
            <button
              key={a.label}
              ref={a.primary ? primaryRef : undefined}
              type="button"
              onClick={a.onClick}
              className={`min-h-[56px] text-[length:var(--text-body)] ${
                ios ? 'min-w-[50%] flex-1 border-[var(--ios-separator)] [&+&]:border-l' : 'rounded-full px-5'
              } ${a.destructive ? 'text-[#b3261e]' : ios ? 'text-[var(--ios-tint)]' : 'text-[var(--md-sys-color-primary)]'} ${
                a.primary ? 'font-bold' : 'font-medium'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
