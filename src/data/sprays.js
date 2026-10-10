// Casing sprays. `art` picks the drawing in SprayArt.jsx; `count` is how many land on the casing.
export const SPRAYS = [
  { id: 'glitter', name: 'Glitter Spray', art: 'glitter', count: 34 },
  { id: 'star', name: 'Star Spray', art: 'star', count: 16 },
  { id: 'heart', name: 'Heart Spray', art: 'heart', count: 14 },
  { id: 'diamond', name: 'Diamond Spray', art: 'diamond', count: 16 },
  { id: 'bubbly', name: 'Bubbly Spray', art: 'bubble', count: 16 },
  { id: 'sticker', name: 'Sticker Spray', art: 'sticker', count: 4 },
]

export const sprayById = (id) => SPRAYS.find((s) => s.id === id) ?? SPRAYS[0]
