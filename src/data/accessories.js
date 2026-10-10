// "Make it a…": what the finished squishy hangs from. Drawn at the shape's `attach` point
// (see Accessory in SquishyView.jsx), so it wobbles along with the squishy.
export const ACCESSORIES = [
  { id: 'none', name: 'Just Squishy' },
  { id: 'keychain', name: 'Keychain' },
  { id: 'bag-clip', name: 'Bag Clip' },
  { id: 'necklace', name: 'Necklace' },
  { id: 'phone-charm', name: 'Phone Charm' },
]

export const accessoryById = (id) => ACCESSORIES.find((a) => a.id === id) ?? ACCESSORIES[0]
