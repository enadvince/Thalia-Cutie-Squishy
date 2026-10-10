import { useCallback, useEffect, useRef, useState } from 'react'

// Gentle playtime reminder. Counts only while the app is on screen, keeps counting across reloads,
// and starts fresh after a real break (30 minutes away). Stored on this device only.
const KEY = 'thalia-squishies:playtime'
const BREAK_MS = 30 * 60 * 1000
const TICK_MS = 5000

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved && Date.now() - saved.last < BREAK_MS) return saved.used
  } catch {
    // Storage unavailable: count from zero.
  }
  return 0
}

function write(used) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ used, last: Date.now() }))
  } catch {
    // Storage unavailable: the reminder still works for this visit.
  }
}

// `minutes`: the reminder length (0 = off). Returns whether it's nap time, and `extend(minutes)` for grown-ups.
export function usePlaytime(minutes) {
  const [napping, setNapping] = useState(false)
  const used = useRef(0) // ms played in this stretch

  useEffect(() => {
    if (!minutes) {
      setNapping(false)
      return
    }
    const limit = minutes * 60 * 1000
    used.current = read()
    let last = Date.now()
    const check = () => setNapping(used.current >= limit)
    const tick = () => {
      const now = Date.now()
      if (document.visibilityState === 'visible') used.current += Math.min(now - last, TICK_MS * 2)
      last = now
      write(used.current)
      check()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        used.current = read() // a long time away counts as a break
        last = Date.now()
        check()
      } else write(used.current)
    }
    check()
    const id = setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
      write(used.current)
    }
  }, [minutes])

  // A grown-up gives `more` minutes before the next reminder.
  const extend = useCallback(
    (more) => {
      used.current = Math.max(0, minutes - more) * 60 * 1000
      write(used.current)
      setNapping(false)
    },
    [minutes],
  )

  return { napping, extend }
}
