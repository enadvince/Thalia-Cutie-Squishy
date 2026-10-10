import { createContext, useContext, useEffect, useReducer } from 'react'
import { MODES } from '../data/modes'
import { setMuted } from '../lib/audio'

// All state lives here and autosaves to localStorage. Nothing leaves the device.
const STORAGE_KEY = 'thalia-squishies:v1'

// A new squishy starts with every choice already made (pink slime in a gel dumpling),
// so the preview is never empty and Next always works.
export const DEFAULT_DRAFT = {
  fillingType: 'slime',
  fillingColors: ['bubblegum-pop'],
  addons: [],
  spray: 'glitter',
  sticker: null,
  scent: 'bubble-gum',
  casingType: 'gel',
  shape: 'dumpling',
  fill: 0,
}

const initialState = {
  settings: { mode: 'little', muted: false, readAloud: MODES.little.readAloudDefault },
  // `draft` is the squishy being made; `past` holds earlier drafts for Undo.
  maker: { step: 0, furthest: 0, draft: DEFAULT_DRAFT, past: [] },
}

// Testing only, until the parent gate (Phase 7) can switch modes: ?mode=big or ?mode=little.
function withModeOverride(state) {
  const mode = new URLSearchParams(window.location.search).get('mode')
  if (!MODES[mode]) return state
  return { ...state, settings: { ...state.settings, mode, readAloud: MODES[mode].readAloudDefault } }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved) {
      return withModeOverride({
        settings: { ...initialState.settings, ...saved.settings },
        maker: { ...initialState.maker, ...saved.maker, draft: { ...DEFAULT_DRAFT, ...saved.maker?.draft } },
      })
    }
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return withModeOverride(initialState)
}

function reducer(state, action) {
  const { maker } = state
  switch (action.type) {
    case 'setStep':
      return {
        ...state,
        maker: { ...maker, step: action.step, furthest: Math.max(maker.furthest, action.step) },
      }
    case 'updateDraft':
      return {
        ...state,
        maker: { ...maker, past: [...maker.past, maker.draft].slice(-50), draft: { ...maker.draft, ...action.patch } },
      }
    case 'undo':
      if (maker.past.length === 0) return state
      return {
        ...state,
        maker: { ...maker, draft: maker.past.at(-1), past: maker.past.slice(0, -1) },
      }
    case 'setSetting':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Private mode / quota: the game still works, it just won't remember.
    }
  }, [state])

  useEffect(() => setMuted(state.settings.muted), [state.settings.muted])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export const useGame = () => useContext(GameContext)
