import { FILLINGS } from '../data/fillings'
import { COLORS } from '../data/colors'
import { ADDONS, isAddonUnlocked } from '../data/addons'
import { SPRAYS } from '../data/sprays'
import { STICKERS, isStickerUnlocked } from '../data/stickers'
import { SCENTS, SODA_FLAVORS } from '../data/scents'
import { CASING_TYPES } from '../data/casings'
import { SHAPES } from '../data/shapes'
import { ACCESSORIES } from '../data/accessories'
import { PRESET_NAMES, LABEL_PRESETS } from '../data/names'

const pick = (list) => list[Math.floor(Math.random() * list.length)]
const pickSome = (list, count) => [...list].sort(() => Math.random() - 0.5).slice(0, count)
const between = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1))

// "Surprise me!": a whole squishy made at random from everything she has unlocked, filled and ready to play.
export function randomDraft(base, stars = 0) {
  const spray = pick(SPRAYS)
  const scent = pick(SCENTS)
  return {
    ...base,
    fillingType: pick(FILLINGS).id,
    fillingColors: pickSome(COLORS, between(1, 3)).map((c) => c.id),
    addons: pickSome(ADDONS.filter((a) => isAddonUnlocked(a, stars)), between(0, 3)).map((a) => a.id),
    spray: spray.id,
    sticker: spray.id === 'sticker' ? pick(STICKERS.filter((s) => isStickerUnlocked(s, stars))).id : null,
    scent: scent.id,
    sodaFlavor: scent.flavors ? pick(SODA_FLAVORS).id : null,
    casingType: pick(CASING_TYPES).id,
    shape: pick(SHAPES).id,
    fill: 1,
    accessory: Math.random() < 0.5 ? 'none' : pick(ACCESSORIES).id,
    label: Math.random() < 0.4 ? pick(LABEL_PRESETS) : null,
    name: pick(PRESET_NAMES),
    savedId: null,
  }
}
