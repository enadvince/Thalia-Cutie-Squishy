import { useGame } from '../state/GameContext'
import { pop } from '../lib/audio'
import { speak } from '../lib/speech'

// Applying a pick: a pop, the option's name read aloud (when read-aloud is on), and an undoable draft update.
export function useChoose() {
  const { state, dispatch } = useGame()
  const { readAloud, muted } = state.settings
  return (patch, name, pitch = 1) => {
    pop(pitch)
    if (readAloud && !muted && name) speak(name)
    dispatch({ type: 'updateDraft', patch })
  }
}
