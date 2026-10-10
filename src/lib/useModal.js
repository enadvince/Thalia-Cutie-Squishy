import { useEffect } from 'react'

// For modals portaled to <body>: the app behind becomes inert (no focus, no taps, hidden from
// VoiceOver/TalkBack), focus moves into the modal, and it returns to where it was on close.
let open = 0
export function useModal(ref) {
  useEffect(() => {
    const root = document.getElementById('root')
    const before = document.activeElement
    open += 1
    root.inert = true
    if (ref?.current && !ref.current.contains(document.activeElement)) ref.current.focus({ preventScroll: true })
    return () => {
      open -= 1
      if (!open) root.inert = false
      if (before?.isConnected) before.focus({ preventScroll: true })
    }
  }, [ref])
}
