import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { usePlatform } from './PlatformContext'
import { HOLD_SECONDS, makeProblem } from '../lib/parentGate'
import Icon from './Icon'
import { useModal } from '../lib/useModal'

// "For grown-ups": hold a button for 3 seconds, then answer a multiplication problem written in words.
// A wrong answer starts over with a new problem. Never read aloud.
export default function ParentGate({ onPass, onCancel }) {
  const ios = usePlatform() === 'ios'
  const titleId = useId()
  const [problem, setProblem] = useState(makeProblem)
  const [step, setStep] = useState('hold') // 'hold' → 'math'
  const [retry, setRetry] = useState(false)
  const cancelRef = useRef(onCancel)
  const boxRef = useRef(null)
  useModal(boxRef)
  cancelRef.current = onCancel

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && cancelRef.current()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const wrong = () => {
    setProblem(makeProblem())
    setRetry(true)
    setStep('hold')
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center p-[var(--gutter)]">
      <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
      <motion.div
        ref={boxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`chrome-font relative flex max-h-[92dvh] w-full max-w-md outline-none flex-col gap-4 overflow-y-auto p-6 text-ink
          shadow-[0_12px_40px_rgba(59,42,74,0.25)] ${ios ? 'rounded-[1.25rem] bg-cream' : 'rounded-[28px] bg-[var(--md-sys-color-surface-container)]'}`}
      >
        <div className="flex items-center gap-3">
          <Icon name="lock" size={28} />
          <h2 id={titleId} className="min-w-0 flex-1 text-[length:var(--text-title)] font-semibold leading-tight">
            For grown-ups
          </h2>
        </div>
        <p role="status" className="text-[length:var(--text-label)] text-ink-soft">
          {retry ? 'Not quite. Here’s a new one: ' : ''}
          {step === 'hold' ? `Press and hold the button for ${HOLD_SECONDS} seconds.` : 'Type the answer to continue.'}
        </p>

        {step === 'hold' ? <HoldButton onDone={() => setStep('math')} /> : <MathCheck problem={problem} onRight={onPass} onWrong={wrong} />}

        <button
          type="button"
          onClick={onCancel}
          className="min-h-[56px] self-center rounded-full px-6 text-[length:var(--text-body)] font-semibold text-ink-soft"
        >
          Cancel
        </button>
      </motion.div>
    </div>,
    document.body,
  )
}

// Fills a ring while held (touch, mouse, or Space/Enter); letting go early empties it.
function HoldButton({ onDone }) {
  const [progress, setProgress] = useState(0)
  const raf = useRef(0)
  const start = useRef(0)
  const holding = useRef(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  const begin = () => {
    if (holding.current) return
    holding.current = true
    start.current = performance.now()
    const frame = (now) => {
      const p = Math.min(1, (now - start.current) / (HOLD_SECONDS * 1000))
      setProgress(p)
      if (p >= 1) {
        holding.current = false
        doneRef.current()
      } else raf.current = requestAnimationFrame(frame)
    }
    raf.current = requestAnimationFrame(frame)
  }
  const end = () => {
    holding.current = false
    cancelAnimationFrame(raf.current)
    setProgress(0)
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const r = 44
  const circumference = 2 * Math.PI * r
  return (
    <button
      type="button"
      aria-label={`Hold for ${HOLD_SECONDS} seconds`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        begin()
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault()
          begin()
        }
      }}
      onKeyUp={(e) => (e.key === ' ' || e.key === 'Enter') && end()}
      onContextMenu={(e) => e.preventDefault()}
      style={{ WebkitTouchCallout: 'none' }}
      className="relative mx-auto grid size-[120px] touch-none place-items-center rounded-full bg-white shadow-[var(--shadow-soft)] select-none"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--focus-ring)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <span className="relative text-[length:var(--text-label)] font-bold">Hold</span>
    </button>
  )
}

function MathCheck({ problem, onRight, onWrong }) {
  const [text, setText] = useState('')
  const inputId = useId()
  const ref = useRef(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (Number(text) === problem.answer) onRight()
        else onWrong()
      }}
    >
      <label htmlFor={inputId} className="text-[length:var(--text-body)] font-semibold">
        {problem.question}
      </label>
      <div className="flex gap-2">
        <input
          ref={ref}
          id={inputId}
          value={text}
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          onChange={(e) => setText(e.target.value.replace(/\D/g, ''))}
          className="min-h-[56px] min-w-0 flex-1 rounded-2xl bg-white px-4 text-[length:var(--text-body)] text-ink ring-2 ring-ink/20 outline-none focus:ring-ink"
        />
        <button type="submit" className="min-h-[56px] shrink-0 rounded-2xl bg-lilac-300 px-5 text-[length:var(--text-label)] font-extrabold">
          Check
        </button>
      </div>
    </form>
  )
}
