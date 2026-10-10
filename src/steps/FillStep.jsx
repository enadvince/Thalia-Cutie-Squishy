import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../state/GameContext'
import { squelch, sparkle, boing, gloop } from '../lib/audio'
import { speak } from '../lib/speech'
import { tick } from '../lib/haptics'
import SquishyView from '../components/SquishyView'
import FillingJar from '../components/FillingJar'
import Icon from '../components/Icon'
import { colorById } from '../data/colors'

const FILL_RATE = 0.33 // fullness per second while pouring (about 3s to full)
const MIN_SQUIRT = 0.05 // a quick tap always adds a little
export const MAX_FILL = 1.25 // past 1 is a happy overfill jiggle, never a mistake

const FillContext = createContext(null)
const useFill = () => useContext(FillContext)

// Owns the live fill level while pouring (updated every frame) and commits it to the
// draft once per squeeze, so each squeeze is one Undo step.
export function FillProvider({ children }) {
  const { state, dispatch } = useGame()
  const { draft } = state.maker
  const { readAloud, muted } = state.settings
  const [fill, setFill] = useState(draft.fill)
  const [pouring, setPouring] = useState(false)
  const [bursts, setBursts] = useState(0)
  const [jiggles, setJiggles] = useState(0)
  const fillRef = useRef(draft.fill)
  const pouringRef = useRef(false)
  const startFill = useRef(0)

  // Undo (or any outside change) resets the live level.
  useEffect(() => {
    if (pouringRef.current) return
    fillRef.current = draft.fill
    setFill(draft.fill)
  }, [draft.fill])

  const celebrate = () => {
    sparkle()
    tick()
    setBursts((b) => b + 1)
    if (readAloud && !muted) speak('All full! Yay!')
  }

  useEffect(() => {
    if (!pouring) return
    let last = performance.now()
    let lastSquelch = 0
    let lastGloop = 0
    let lastBoing = 0
    let raf
    const step = (now) => {
      const prev = fillRef.current
      const next = Math.min(MAX_FILL, prev + ((now - last) / 1000) * FILL_RATE)
      last = now
      if (prev < 1 && next >= 1) celebrate()
      if (next > 1 && now - lastBoing > 700) {
        boing()
        setJiggles((j) => j + 1)
        lastBoing = now
      }
      // Pouring sounds: a wet squelch plus bubbly gloops, rising as it fills.
      if (next < 1 && now - lastSquelch > 150) {
        squelch(next)
        lastSquelch = now
      }
      if (next < 1 && now - lastGloop > 230) {
        gloop(next)
        lastGloop = now
      }
      fillRef.current = next
      setFill(next)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // The loop only restarts when pouring starts or stops.
  }, [pouring])

  const start = () => {
    if (pouringRef.current) return
    pouringRef.current = true
    startFill.current = fillRef.current
    squelch(fillRef.current)
    gloop(fillRef.current)
    setPouring(true)
  }

  const stop = () => {
    if (!pouringRef.current) return
    pouringRef.current = false
    setPouring(false)
    const value = Math.min(MAX_FILL, Math.max(fillRef.current, startFill.current + MIN_SQUIRT))
    if (fillRef.current < 1 && value >= 1) celebrate()
    fillRef.current = value
    setFill(value)
    dispatch({ type: 'updateDraft', patch: { fill: value } })
  }

  return (
    <FillContext.Provider value={{ fill, pouring, bursts, jiggles, start, stop }}>{children}</FillContext.Provider>
  )
}

// Stage: the filling jar with a draggable piping bag, and the casing that inflates as it fills.
export function FillStage({ draft }) {
  const { fill, pouring, bursts, jiggles, start, stop } = useFill()
  const stageRef = useRef(null)
  const squishyRef = useRef(null)
  const bagColor = colorById(draft.fillingColors[0]).hex

  const overSquishy = (point) => {
    const r = squishyRef.current?.getBoundingClientRect()
    return r && point.x > r.left && point.x < r.right && point.y > r.top && point.y < r.bottom
  }

  return (
    <div ref={stageRef} className="flex size-full items-end gap-1">
      <div className="relative h-[55%] w-[28%] shrink-0">
        <FillingJar draft={draft} />
        <motion.div
          role="img"
          aria-label="Piping bag. Drag it onto your squishy to fill it."
          drag
          dragSnapToOrigin
          dragConstraints={stageRef}
          dragElastic={0.2}
          whileDrag={{ scale: 1.15, rotate: -10 }}
          onDrag={(_, info) => (overSquishy(info.point) ? start() : stop())}
          onDragEnd={stop}
          className="absolute -top-6 left-[calc(50%-2rem)] z-10 size-16 cursor-grab touch-none active:cursor-grabbing"
        >
          <PipingBag color={bagColor} pouring={pouring} />
        </motion.div>
      </div>
      <div ref={squishyRef} className="h-full min-w-0 flex-1">
        <SquishyView draft={draft} fill={fill} jiggle={jiggles} burst={bursts} />
      </div>
    </div>
  )
}

function PipingBag({ color, pouring }) {
  return (
    <svg viewBox="0 0 64 64" className="size-full overflow-visible" aria-hidden="true">
      <path d="M10 8h44L38 46h-12z" fill="#d4bfff" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 8h36l-4 9H18z" fill={color} />
      <path d="M26 46h12l-4 10h-4z" fill="#c9d2e6" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 22l4 14" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      {pouring && <circle className="drip" cx="32" cy="60" r="4" fill={color} />}
    </svg>
  )
}

// Panel: the big hold-to-fill button and a fullness meter.
export function FillPanel() {
  const { fill, pouring, start, stop } = useFill()
  const full = fill >= 1
  const extra = fill > 1.02

  const isKey = (e) => e.key === ' ' || e.key === 'Enter'

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <motion.button
        type="button"
        aria-label="Fill! Hold to fill your squishy"
        animate={{ scale: pouring ? 0.93 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          start()
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
        onKeyDown={(e) => {
          if (isKey(e) && !e.repeat) {
            e.preventDefault()
            start()
          }
        }}
        onKeyUp={(e) => isKey(e) && stop()}
        onContextMenu={(e) => e.preventDefault()}
        style={{ WebkitTouchCallout: 'none' }}
        className={`flex min-h-28 w-full max-w-sm touch-none items-center justify-center gap-3 rounded-[2rem] px-6
          font-display text-[2.25rem] font-bold text-ink shadow-[var(--shadow-candy)] select-none ${pouring ? 'bg-pink-500' : 'bg-pink-300'}`}
      >
        <Icon name="bag" size={44} />
        FILL!
      </motion.button>

      <div className="flex w-full max-w-sm items-center gap-3">
        <div
          role="progressbar"
          aria-label="How full your squishy is"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(Math.min(fill, 1) * 100)}
          aria-valuetext={extra ? 'Full, and extra squishy!' : full ? 'Full!' : `${Math.round(fill * 100)} percent full`}
          className="h-6 flex-1 overflow-hidden rounded-full bg-white shadow-inner ring-2 ring-ink/15"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-300 via-lilac-300 to-aqua-300"
            style={{ width: `${Math.min(fill, 1) * 100}%` }}
          />
        </div>
        <span className={`grid size-12 shrink-0 place-items-center rounded-full ${full ? 'bg-pink-300 text-ink' : 'bg-white text-ink-soft'}`}>
          <Icon name="heart" size={28} filled={full} />
        </span>
      </div>
      {full && (
        <motion.p
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 font-display text-[length:var(--text-title)] font-semibold text-ink"
        >
          <Icon name="sparkle" size={24} filled />
          {extra ? 'Extra squishy!' : 'All full!'}
        </motion.p>
      )}
    </div>
  )
}
