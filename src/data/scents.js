// Spray scents. `tint` is blended into the casing color (SCENT_TINT_AMOUNT);
// `particle` picks the floating scent bubble drawing in ScentArt.jsx.
// Soda has flavors: picking it opens a flavor sheet, and the flavor sets the tint and fizz color.
export const SCENT_TINT_AMOUNT = 0.12

// Rainbow soda flavors (red → violet).
export const SODA_FLAVORS = [
  { id: 'cherry', name: 'Cherry Soda', tint: '#e8364a' },
  { id: 'orange', name: 'Orange Soda', tint: '#ff8a1f' },
  { id: 'lemon', name: 'Lemon Soda', tint: '#f2c200' },
  { id: 'lime', name: 'Lime Soda', tint: '#4fc244' },
  { id: 'blue-raspberry', name: 'Blue Raspberry Soda', tint: '#2f8fe8' },
  { id: 'blueberry', name: 'Blueberry Soda', tint: '#4b5bd6' },
  { id: 'grape', name: 'Grape Soda', tint: '#8a4fd6' },
]

export const SCENTS = [
  { id: 'watermelon', name: 'Watermelon', tint: '#ff6f91', particle: 'watermelon' },
  { id: 'bubble-gum', name: 'Bubble Gum', tint: '#ff9fd2', particle: 'bubble' },
  { id: 'strawberry', name: 'Strawberry', tint: '#ff5a7a', particle: 'strawberry' },
  { id: 'soda', name: 'Soda', tint: SODA_FLAVORS[0].tint, particle: 'fizz', flavors: SODA_FLAVORS },
  { id: 'blueberry', name: 'Blueberry', tint: '#5b7bea', particle: 'blueberry' },
  { id: 'blackberry', name: 'Blackberry', tint: '#4b2a5e', particle: 'blackberry' },
  { id: 'raspberry', name: 'Raspberry', tint: '#e0306b', particle: 'raspberry' },
  { id: 'cake', name: 'Cake', tint: '#f6c48a', particle: 'cake' },
]

const RENAMED = { cola: 'soda', 'orange-soda': 'soda' } // older saves

export const scentById = (id) => SCENTS.find((s) => s.id === (RENAMED[id] ?? id)) ?? SCENTS[0]
export const sodaFlavorById = (id) => SODA_FLAVORS.find((f) => f.id === id) ?? SODA_FLAVORS[0]

// What a squishy's scent looks like: name, tint and particle color (a soda uses its flavor).
export function scentLook(draft) {
  const scent = scentById(draft.scent)
  if (!scent.flavors) return { id: scent.id, name: scent.name, tint: scent.tint, particle: scent.particle }
  const flavor = sodaFlavorById(draft.sodaFlavor ?? (draft.scent === 'orange-soda' ? 'orange' : null))
  return { id: `soda-${flavor.id}`, name: flavor.name, tint: flavor.tint, particle: 'fizz', color: flavor.tint }
}
