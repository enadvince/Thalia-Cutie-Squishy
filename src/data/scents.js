// Spray scents. `tint` is blended into the casing color (SCENT_TINT_AMOUNT);
// `particle` picks the floating scent bubble drawing in ScentArt.jsx.
export const SCENT_TINT_AMOUNT = 0.12

export const SCENTS = [
  { id: 'watermelon', name: 'Watermelon', tint: '#ff6f91', particle: 'watermelon' },
  { id: 'bubble-gum', name: 'Bubble Gum', tint: '#ff9fd2', particle: 'bubble' },
  { id: 'strawberry', name: 'Strawberry', tint: '#ff5a7a', particle: 'strawberry' },
  { id: 'cola', name: 'Cola', tint: '#8a4b2a', particle: 'fizz' },
  { id: 'blueberry', name: 'Blueberry', tint: '#5b7bea', particle: 'blueberry' },
  { id: 'blackberry', name: 'Blackberry', tint: '#4b2a5e', particle: 'blackberry' },
  { id: 'raspberry', name: 'Raspberry', tint: '#e0306b', particle: 'raspberry' },
  { id: 'cake', name: 'Cake', tint: '#f6c48a', particle: 'cake' },
  { id: 'orange-soda', name: 'Orange Soda', tint: '#ff9a3c', particle: 'orangeFizz' },
]

export const scentById = (id) => SCENTS.find((s) => s.id === id) ?? SCENTS[0]
