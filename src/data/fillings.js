// Filling types. `texture` drives how the filling looks in the jar (and later, how it plays).
// gloss: 0 (matte) – 1 (wet shine). pattern: surface detail drawn over the color.
export const FILLINGS = [
  { id: 'crunchy', name: 'Crunchy', icon: 'crunch', pitch: 1.35, texture: { gloss: 0.3, pattern: 'beads' } },
  { id: 'slow-rising', name: 'Slow Rising', icon: 'rise', pitch: 0.7, texture: { gloss: 0.1, pattern: 'pores' } },
  { id: 'slime', name: 'Slime', icon: 'drip', pitch: 0.9, texture: { gloss: 0.95, pattern: 'none' } },
  { id: 'dough', name: 'Dough', icon: 'dough', pitch: 1, texture: { gloss: 0.05, pattern: 'grain' } },
  { id: 'butter-slime', name: 'Butter Slime', icon: 'butter', pitch: 1.1, texture: { gloss: 0.4, pattern: 'cream' } },
  { id: 'putty', name: 'Putty', icon: 'putty', pitch: 0.8, texture: { gloss: 0.55, pattern: 'folds' } },
]

export const fillingById = (id) => FILLINGS.find((f) => f.id === id) ?? FILLINGS[0]
