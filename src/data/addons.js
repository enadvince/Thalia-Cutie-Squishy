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
]

export const addonById = (id) => ADDONS.find((a) => a.id === id)
