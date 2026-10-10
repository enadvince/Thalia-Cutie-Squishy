// Casing types: how see-through and shiny the casing is.
//   opacity: 0 = clear (filling fully visible), 1 = solid
export const CASING_TYPES = [
  { id: 'balloon', name: 'Balloon', icon: 'balloon', opacity: 0.6, gloss: 0.4, rim: 0.5 },
  { id: 'gel', name: 'Gel', icon: 'drop', opacity: 0.32, gloss: 0.9, rim: 0.9 },
  { id: 'plastic', name: 'Plastic', icon: 'shine', opacity: 0.88, gloss: 1, rim: 0.7 },
]

export const casingTypeById = (id) => CASING_TYPES.find((c) => c.id === id) ?? CASING_TYPES[1]
