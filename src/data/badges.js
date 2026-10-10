import { colorById } from './colors'
import { SURPRISE_ADDONS } from './addons'
import { SHAPES } from './shapes'
import { FILLINGS } from './fillings'

// Badges reward exploring, never skill. `test(stats, squishy)` gets totals across everything
// she has saved (see lib/rewards.js) and the squishy just saved.
// `challenge: true` badges are Big Maker's light challenges (only offered in Big Maker).
export const BADGES = [
  { id: 'first', name: 'First Squishy!', icon: 'heart', hint: 'Save a squishy', test: (s) => s.saved >= 1 },
  { id: 'squad', name: 'Squishy Squad', icon: 'shelf', hint: 'Save 5 squishies', test: (s) => s.saved >= 5 },
  { id: 'every-filling', name: 'Tried every filling!', icon: 'jar', hint: `Try all ${FILLINGS.length} textures`, test: (s) => s.fillings >= FILLINGS.length },
  { id: 'rainbow', name: 'Rainbow Maker', icon: 'rainbow', hint: 'Use 10 colors', test: (s) => s.colors >= 10 },
  { id: 'shapes', name: 'Shape Explorer', icon: 'shapes', hint: 'Try 5 shapes', test: (s) => s.shapes >= 5 },
  { id: 'every-shape', name: 'Every Shape!', icon: 'star', hint: `Try all ${SHAPES.length} shapes`, test: (s) => s.shapes >= SHAPES.length },
  { id: 'sniffer', name: 'Scent Sniffer', icon: 'scent', hint: 'Try 5 scents', test: (s) => s.scents >= 5 },
  { id: 'beads', name: 'Bead Collector', icon: 'bead', hint: 'Try 8 add-ons', test: (s) => s.addons >= 8 },
  { id: 'sticker', name: 'Sticker Star', icon: 'sparkle', hint: 'Use Sticker Spray', test: (s) => s.sprays.includes('sticker') },
  { id: 'surprise', name: 'Surprise!', icon: 'gift', hint: 'Use a daily surprise', test: (s) => s.usedSurprise },
  {
    id: 'only-blues', challenge: true, name: 'Blue Lagoon', icon: 'drop', hint: 'Make a squishy using only blues',
    test: (_, sq) => sq.fillingColors.every((c) => colorById(c).family === 'blues'),
  },
  { id: 'triple', challenge: true, name: 'Triple Swirl', icon: 'palette', hint: 'Swirl 3 colors in one squishy', test: (_, sq) => sq.fillingColors.length >= 3 },
  { id: 'bead-party', challenge: true, name: 'Bead Party', icon: 'bead', hint: 'Use 5 add-ons in one squishy', test: (_, sq) => sq.addons.length >= 5 },
  { id: 'extra', challenge: true, name: 'Extra Squishy', icon: 'balloon', hint: 'Overfill a squishy', test: (_, sq) => sq.fill > 1.02 },
]

export const STARS_PER_NEW_SQUISHY = 1
export const STARS_PER_BADGE = 3

export const badgeById = (id) => BADGES.find((b) => b.id === id)
export const SURPRISE_IDS = new Set(SURPRISE_ADDONS.map((a) => a.id))
