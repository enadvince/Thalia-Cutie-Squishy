// Casing types: how see-through and shiny the casing is, and how its surface reacts in Play.
//   opacity: 0 = clear (filling fully visible), 1 = solid
//   play (combined with the texture's physics in Step 4 — see playPhysics):
//     kScale: scales the texture's springiness   kAdd: the casing's own pull back to shape
//     moldScale: how much of the texture's moldability comes through (0–1)   moldAdd: extra moldability
//     recover: how fast a molded shape creeps back (per second; 0 = it stays)
//     bulge: spots bubble up in a ring around a press (balloon)   stress: stretched spots go pale (plastic)
//   wax: a waxy coat that cracks and chips off   bubbles: a layer of bubbles that pop when pressed
export const CASING_TYPES = [
  {
    id: 'balloon', name: 'Balloon', icon: 'balloon', opacity: 0.6, gloss: 0.4, rim: 0.5,
    play: { kScale: 1.15, kAdd: 6, moldScale: 0.45, recover: 0.6, bulge: 0.11 },
  },
  {
    id: 'gel', name: 'Gel', icon: 'drop', opacity: 0.32, gloss: 0.9, rim: 0.9,
    play: { kScale: 0.7, moldScale: 1, moldAdd: 0.3, recover: 0 },
  },
  {
    id: 'plastic', name: 'Plastic', icon: 'shine', opacity: 0.88, gloss: 1, rim: 0.7,
    play: { kScale: 1.2, kAdd: 3, moldScale: 0.7, recover: 0.25, stress: 1 },
  },
  // Wax: a gel casing with a waxy coat on the outside that cracks and chips off in Play.
  {
    id: 'wax', name: 'Wax', icon: 'candle', opacity: 0.32, gloss: 0.6, rim: 0.7, wax: true,
    play: { kScale: 0.7, moldScale: 1, moldAdd: 0.3, recover: 0 },
  },
  // Bubble wrap: a crinkly clear casing covered in little bubbles that pop when pressed.
  {
    id: 'bubble-wrap', name: 'Bubble Wrap', icon: 'bubbles', opacity: 0.25, gloss: 0.7, rim: 0.8, bubbles: true,
    play: { kScale: 0.95, kAdd: 2, moldScale: 0.8, recover: 0.15 },
  },
]

export const casingTypeById = (id) => CASING_TYPES.find((c) => c.id === id) ?? CASING_TYPES[1]

// The texture's physics with the casing folded in. Together they decide how moldable the squishy is
// and how fast (if at all) it creeps back to shape: Putty in Gel stays put, Putty in a Balloon is pulled
// back by the rubber; Slime in Gel holds dents a little, Slime in Plastic snaps right back.
export function playPhysics(physics, casing) {
  const p = casing.play ?? {}
  const plasticity = Math.min(1, physics.plasticity * (p.moldScale ?? 1) + (p.moldAdd ?? 0))
  return {
    ...physics,
    k: physics.k * (p.kScale ?? 1) + (p.kAdd ?? 0),
    plasticity,
    // A moldier texture fights the casing's pull: fully moldable fillings recover at half speed.
    recover: (p.recover ?? 0) * (1 - physics.plasticity * 0.5),
    bulge: p.bulge ?? 0,
    stress: p.stress ?? 0,
  }
}
