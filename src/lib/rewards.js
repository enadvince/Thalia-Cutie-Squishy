import { BADGES, STARS_PER_NEW_SQUISHY, STARS_PER_BADGE, SURPRISE_IDS } from '../data/badges'
import { STICKERS } from '../data/stickers'
import { ADDONS, SURPRISE_ADDONS } from '../data/addons'
import { seeded } from './random'

const union = (list, more) => [...new Set([...list, ...more])]

export const EMPTY_EXPLORED = { fillings: [], colors: [], shapes: [], scents: [], addons: [], sprays: [] }

// Everything that unlocks with stars.
const UNLOCKABLES = [
  ...STICKERS.filter((s) => s.unlock !== 'starter').map((s) => ({ kind: 'sticker', id: s.id, stars: s.unlock.stars })),
  ...ADDONS.filter((a) => a.unlock).map((a) => ({ kind: 'addon', id: a.id, stars: a.unlock.stars })),
]

// After a save: remember what she has tried, award new badges and stars, and queue
// celebrations ("news") for badges and anything the new stars unlocked. Stars never go down.
export function rewardsAfterSave(state, squishy, isNew) {
  const ex = state.explored
  const explored = {
    fillings: union(ex.fillings, [squishy.fillingType]),
    colors: union(ex.colors, squishy.fillingColors),
    shapes: union(ex.shapes, [squishy.shape]),
    scents: union(ex.scents, [squishy.scent]),
    addons: union(ex.addons, squishy.addons),
    sprays: union(ex.sprays, [squishy.spray]),
  }
  const stats = {
    saved: state.shelf.length,
    fillings: explored.fillings.length,
    colors: explored.colors.length,
    shapes: explored.shapes.length,
    scents: explored.scents.length,
    addons: explored.addons.length,
    sprays: explored.sprays,
    usedSurprise: explored.addons.some((id) => SURPRISE_IDS.has(id)),
  }
  const big = state.settings.mode === 'big'
  const earned = BADGES.filter((b) => !state.badges.includes(b.id) && (!b.challenge || big) && b.test(stats, squishy))
  const stars = state.stars + (isNew ? STARS_PER_NEW_SQUISHY : 0) + earned.length * STARS_PER_BADGE
  const unlocked = UNLOCKABLES.filter((u) => u.stars > state.stars && u.stars <= stars)
  return {
    ...state,
    explored,
    stars,
    badges: [...state.badges, ...earned.map((b) => b.id)],
    news: [...state.news, ...earned.map((b) => ({ kind: 'badge', id: b.id })), ...unlocked.map(({ kind, id }) => ({ kind, id }))],
  }
}

// Today's date as YYYY-MM-DD in local time.
export const todayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

// The same mystery add-on all day, a new one tomorrow.
export const todaysSurprise = (key = todayKey()) => SURPRISE_ADDONS[Math.floor(seeded(key)() * SURPRISE_ADDONS.length)]
