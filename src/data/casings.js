// Casing types: how see-through and shiny the casing is, and how its surface reacts in Play.
//   opacity: 0 = clear (filling fully visible), 1 = solid
//   play (combined with the texture's physics in Step 4):
//     kScale: springier (>1) or softer (<1)   plasticityAdd: holds dents/shapes more
//     bulge: spots bubble up in a ring around a press (balloon)   stress: stretched spots go pale (plastic)
export const CASING_TYPES = [
  { id: 'balloon', name: 'Balloon', icon: 'balloon', opacity: 0.6, gloss: 0.4, rim: 0.5, play: { kScale: 1.15, bulge: 0.11 } },
  { id: 'gel', name: 'Gel', icon: 'drop', opacity: 0.32, gloss: 0.9, rim: 0.9, play: { kScale: 0.7, plasticityAdd: 0.3 } },
  { id: 'plastic', name: 'Plastic', icon: 'shine', opacity: 0.88, gloss: 1, rim: 0.7, play: { kScale: 1.2, stress: 1 } },
  // Wax: a gel casing with a waxy coat on the outside that cracks and chips off in Play.
  { id: 'wax', name: 'Wax', icon: 'candle', opacity: 0.32, gloss: 0.6, rim: 0.7, wax: true, play: { kScale: 0.7, plasticityAdd: 0.3 } },
]

export const casingTypeById = (id) => CASING_TYPES.find((c) => c.id === id) ?? CASING_TYPES[1]

// A texture's physics with the casing type's surface behavior folded in.
export function playPhysics(physics, casing) {
  const p = casing.play ?? {}
  return {
    ...physics,
    k: physics.k * (p.kScale ?? 1),
    plasticity: Math.min(1, physics.plasticity + (p.plasticityAdd ?? 0)),
    bulge: p.bulge ?? 0,
    stress: p.stress ?? 0,
  }
}
