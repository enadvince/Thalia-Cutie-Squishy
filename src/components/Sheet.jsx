import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { usePlatform } from './PlatformContext'
import { transitions } from '../lib/motion'
import { useModal } from '../lib/useModal'

// Modal picker sheet. iOS: HIG sheet (grabber, centered title, "Done").
// Android: M3 modal bottom sheet (scrim, drag handle, 28dp corners).
// Closes with Done, a tap on the scrim, Escape, or system back (it adds a history entry).
export default function Sheet({ title, onClose, children }) {
  const platform = usePlatform()
  const ios = platform === 'ios'
  const titleId = useId()
  const ref = useRef(null)
  useModal(ref)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    history.pushState({ ...history.state, sheet: true }, '')
    const onPop = () => onCloseRef.current()
    const onKey = (e) => e.key === 'Escape' && history.back()
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    ref.current?.focus()
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const close = () => history.back()

  // Portaled to <body>: the step container is transformed during slides, which would break position: fixed.
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`absolute inset-0 ${ios ? 'bg-black/25' : 'bg-black/32'}`}
        onClick={close}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={transitions[platform].page}
        className={`chrome-font relative flex max-h-[88dvh] w-full max-w-2xl flex-col outline-none
          pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(59,42,74,0.18)]
          ${ios ? 'rounded-t-[1.5rem] bg-cream' : 'rounded-t-[28px] bg-[var(--md-sys-color-surface-container)]'}`}
      >
        <div aria-hidden="true" className={`mx-auto mt-2 rounded-full bg-ink/30 ${ios ? 'h-[5px] w-9' : 'h-1 w-8'}`} />
        <div className={`flex items-center gap-2 px-[var(--gutter)] pt-1 ${ios ? 'justify-between' : ''}`}>
          {ios && <span className="w-[56px]" />}
          <h2
            id={titleId}
            className={`min-w-0 flex-1 font-semibold leading-tight break-words ${ios ? 'text-center text-[length:var(--text-body)]' : 'text-[length:var(--text-title)] font-normal'}`}
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            className={`min-h-[56px] min-w-[56px] px-3 font-semibold ${
              ios
                ? 'text-[length:var(--text-body)] text-[var(--ios-tint)]'
                : 'rounded-full bg-[var(--md-sys-color-secondary-container)] px-5 text-[length:var(--text-label)]'
            }`}
          >
            Done
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-[var(--gutter)] pt-2 pb-2">{children}</div>
      </motion.div>
    </div>,
    document.body,
  )
}
