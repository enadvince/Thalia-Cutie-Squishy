// Add-ons mixed into the filling. `art` picks the drawing in AddonArt.jsx; `count` is how many float in the jar.
// Character beads are original designs (not based on any existing characters).
export const MAX_ADDONS = 5

export const ADDONS = [
  { id: 'beads', name: 'Beads', art: 'bead', count: 7 },
  { id: 'glitter', name: 'Glitter', art: 'glitter', count: 16 },
  { id: 'star-beads', name: 'Star Beads', art: 'star', count: 5 },
  { id: 'heart-beads', name: 'Heart Beads', art: 'heart', count: 5 },
  { id: 'little-sprinkles', name: 'Little Sprinkles', art: 'sprinkle', count: 12 },
  { id: 'star-sprinkles', name: 'Star Sprinkles', art: 'starSprinkle', count: 10 },
  { id: 'cloud-puppy', name: 'Cloud Puppy Beads', art: 'cloudPuppy', count: 2 },
  { id: 'bow-kitty', name: 'Bow Kitty Beads', art: 'bowKitty', count: 2 },
  { id: 'bunny-imp', name: 'Bunny Imp Beads', art: 'bunnyImp', count: 2 },
  { id: 'pink-lamb', name: 'Pink Lamb Beads', art: 'pinkLamb', count: 2 },
  { id: 'sunny-pup', name: 'Sunny Pup Beads', art: 'sunnyPup', count: 2 },
  { id: 'pompom', name: 'Pompom Beads', art: 'pompom', count: 4 },
  // Bonus beads, unlocked with stars (shown locked until then).
  { id: 'rainbow-beads', name: 'Rainbow Beads', art: 'rainbowBead', count: 6, unlock: { stars: 8 } },
  { id: 'moon-beads', name: 'Moon Beads', art: 'moon', count: 5, unlock: { stars: 15 } },
]

// Daily surprise: one of these is today's mystery add-on (picked from the date, same all day).
// A squishy made with it keeps it forever.
export const SURPRISE_ADDONS = [
  { id: 'gem-beads', name: 'Gem Beads', art: 'gem', count: 5 },
  { id: 'snowflake-sprinkles', name: 'Snowflake Sprinkles', art: 'snowflake', count: 8 },
  { id: 'clover-beads', name: 'Clover Beads', art: 'clover', count: 5 },
  { id: 'shell-beads', name: 'Shell Beads', art: 'shell', count: 5 },
  { id: 'flower-beads', name: 'Flower Beads', art: 'flower', count: 5 },
]

const ALL_ADDONS = [...ADDONS, ...SURPRISE_ADDONS]
export const addonById = (id) => ALL_ADDONS.find((a) => a.id === id)
export const isAddonUnlocked = (addon, stars = 0) => !addon.unlock || stars >= addon.unlock.stars
