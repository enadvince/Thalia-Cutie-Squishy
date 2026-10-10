// Filling types.
// texture: how the filling looks (gloss 0 = matte … 1 = wet shine; pattern = surface detail).
// physics: how it plays in Step 4 (positions are fractions of the squishy's size, times in seconds)
//   k: spring back to shape (low = slow rebound)   damping: how fast wobbles settle
//   stretch: how far it pulls   press: how deep a press dents   plasticity: how much of a dent stays (Putty)
// sounds: which synthesized sound plays for press / stretch / release (see lib/audio.js).
export const FILLINGS = [
  {
    id: 'crunchy', name: 'Crunchy', icon: 'crunch', pitch: 1.35,
    texture: { gloss: 0.3, pattern: 'beads' },
    physics: { k: 90, damping: 12, stretch: 0.14, press: 0.32, plasticity: 0 },
    sounds: { press: 'crackle', stretch: 'crackle', release: 'pop' },
  },
  {
    id: 'slow-rising', name: 'Slow Rising', icon: 'rise', pitch: 0.7,
    texture: { gloss: 0.1, pattern: 'pores' },
    physics: { k: 5, damping: 8, stretch: 0.22, press: 0.45, plasticity: 0 },
    sounds: { press: 'swish', stretch: 'swish', release: 'swish' },
  },
  {
    id: 'slime', name: 'Slime', icon: 'drip', pitch: 0.9,
    texture: { gloss: 0.95, pattern: 'none' },
    physics: { k: 35, damping: 2.2, stretch: 0.6, press: 0.38, plasticity: 0 },
    sounds: { press: 'squelch', stretch: 'squeak', release: 'squelch' },
  },
  {
    id: 'dough', name: 'Dough', icon: 'dough', pitch: 1,
    texture: { gloss: 0.05, pattern: 'grain' },
    physics: { k: 55, damping: 16, stretch: 0.2, press: 0.3, plasticity: 0 },
    sounds: { press: 'thud', stretch: 'swish', release: 'thud' },
  },
  {
    id: 'butter-slime', name: 'Butter Slime', icon: 'butter', pitch: 1.1,
    texture: { gloss: 0.4, pattern: 'cream' },
    physics: { k: 22, damping: 9, stretch: 0.45, press: 0.36, plasticity: 0 },
    sounds: { press: 'swish', stretch: 'squeak', release: 'swish' },
  },
  {
    id: 'putty', name: 'Putty', icon: 'putty', pitch: 0.8,
    texture: { gloss: 0.55, pattern: 'folds' },
    physics: { k: 60, damping: 12, stretch: 0.28, press: 0.34, plasticity: 0.75 },
    sounds: { press: 'squelch', stretch: 'squeak', release: 'pop' },
  },
]

export const fillingById = (id) => FILLINGS.find((f) => f.id === id) ?? FILLINGS[0]
