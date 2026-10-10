import { createContext, useContext, useEffect, useReducer } from 'react'
import { MODES } from '../data/modes'
import { setMuted } from '../lib/audio'
import { rewardsAfterSave, EMPTY_EXPLORED } from '../lib/rewards'
import { squishyName } from '../data/names'

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
  sodaFlavor: null, // when the scent is Soda
  casingType: 'gel',
  shape: 'dumpling',
  fill: 0,
  accessory: 'none', // keychain, bag clip… (Step 4)
  name: null, // null = an automatic name (see squishyName)
  savedId: null, // set once it's on the Shelf
}

const initialState = {
  settings: { mode: 'little', muted: false, readAloud: MODES.little.readAloudDefault },
  // `draft` is the squishy being made; `past` holds earlier drafts for Undo.
  maker: { step: 0, furthest: 0, draft: DEFAULT_DRAFT, past: [] },
  // Saved squishies: [{ id, name, draft, savedAt }]
  shelf: [],
  // Rewards (stars and badges only ever go up, even if a squishy is deleted).
  stars: 0,
  badges: [],
  explored: EMPTY_EXPLORED, // what she has tried across all saves (for badges)
  news: [], // celebrations still to show: [{ kind: 'badge' | 'sticker' | 'addon', id }]
  surpriseSeen: null, // the day she last unwrapped the daily surprise
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
        shelf: saved.shelf ?? [],
        stars: saved.stars ?? 0,
        badges: saved.badges ?? [],
        explored: { ...EMPTY_EXPLORED, ...saved.explored },
        news: saved.news ?? [],
        surpriseSeen: saved.surpriseSeen ?? null,
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
    case 'saveSquishy':
      return saveDraft(state)
    case 'newSquishy':
      return { ...state, maker: { step: 0, furthest: 0, draft: DEFAULT_DRAFT, past: [] } }
    case 'loadSquishy': {
      // Play a Shelf squishy again. A half-made squishy is saved first so nothing is lost.
      const entry = state.shelf.find((s) => s.id === action.id)
      if (!entry) return state
      const before = maker.past.length && !maker.draft.savedId ? saveDraft(state) : state
      return { ...before, maker: { step: 3, furthest: 3, draft: entry.draft, past: [] } }
    }
    case 'deleteSquishy': {
      const draft = maker.draft.savedId === action.id ? { ...maker.draft, savedId: null } : maker.draft
      return { ...state, shelf: state.shelf.filter((s) => s.id !== action.id), maker: { ...maker, draft } }
    }
    case 'dismissNews':
      return { ...state, news: state.news.slice(1) }
    case 'revealSurprise':
      return { ...state, surpriseSeen: action.day }
    case 'setSetting':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

// Saving again updates the same Shelf spot. Not an Undo step. Saving also earns rewards.
function saveDraft(state) {
  const { maker } = state
  const isNew = !maker.draft.savedId
  const id = maker.draft.savedId ?? `sq-${Date.now()}`
  const draft = { ...maker.draft, savedId: id }
  const entry = { id, name: squishyName(draft), draft, savedAt: Date.now() }
  const shelf = isNew ? [...state.shelf, entry] : state.shelf.map((s) => (s.id === id ? entry : s))
  return rewardsAfterSave({ ...state, maker: { ...maker, draft }, shelf }, draft, isNew)
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
