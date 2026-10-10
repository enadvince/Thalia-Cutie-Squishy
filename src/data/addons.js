// Add-ons mixed into the filling. `art` picks the drawing in AddonArt.jsx.
// How many pieces show is shared out between the picked add-ons (see addonPieces in FillingMass.jsx).
// Character beads are original designs (not based on any existing characters).
export const MAX_ADDONS = 5

export const ADDONS = [
  { id: 'beads', name: 'Beads', art: 'bead' },
  { id: 'glitter', name: 'Glitter', art: 'glitter' },
  { id: 'star-beads', name: 'Star Beads', art: 'star' },
  { id: 'heart-beads', name: 'Heart Beads', art: 'heart' },
  { id: 'little-sprinkles', name: 'Little Sprinkles', art: 'sprinkle' },
  { id: 'star-sprinkles', name: 'Star Sprinkles', art: 'starSprinkle' },
  { id: 'cloud-puppy', name: 'Cloud Puppy Beads', art: 'cloudPuppy' },
  { id: 'bow-kitty', name: 'Bow Kitty Beads', art: 'bowKitty' },
  { id: 'bunny-imp', name: 'Bunny Imp Beads', art: 'bunnyImp' },
  { id: 'pink-lamb', name: 'Pink Lamb Beads', art: 'pinkLamb' },
  { id: 'sunny-pup', name: 'Sunny Pup Beads', art: 'sunnyPup' },
  { id: 'pompom', name: 'Pompom Beads', art: 'pompom' },
  // Bonus beads, unlocked with stars (shown locked until then).
  { id: 'rainbow-beads', name: 'Rainbow Beads', art: 'rainbowBead', unlock: { stars: 8 } },
  { id: 'moon-beads', name: 'Moon Beads', art: 'moon', unlock: { stars: 15 } },
]

// Daily surprise: one of these is today's mystery add-on (picked from the date, same all day).
// A squishy made with it keeps it forever.
export const SURPRISE_ADDONS = [
  { id: 'gem-beads', name: 'Gem Beads', art: 'gem' },
  { id: 'snowflake-sprinkles', name: 'Snowflake Sprinkles', art: 'snowflake' },
  { id: 'clover-beads', name: 'Clover Beads', art: 'clover' },
  { id: 'shell-beads', name: 'Shell Beads', art: 'shell' },
  { id: 'flower-beads', name: 'Flower Beads', art: 'flower' },
]

const ALL_ADDONS = [...ADDONS, ...SURPRISE_ADDONS]
export const addonById = (id) => ALL_ADDONS.find((a) => a.id === id)
export const isAddonUnlocked = (addon, stars = 0) => !addon.unlock || stars >= addon.unlock.stars
