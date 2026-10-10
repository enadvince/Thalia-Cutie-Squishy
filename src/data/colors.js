// 100 colors, generated from 10 families × 10 shades. Names are listed light → dark.
// Each family has an icon so a swatch is never identified by color alone.
export const MAX_FILLING_COLORS = 3

const FAMILIES = [
  { id: 'pinks', name: 'Pinks', icon: 'heart', hue: 330, sat: 85,
    names: ['Fairy Floss', 'Cotton Candy', 'Strawberry Milk', 'Peony Puff', 'Bubblegum Pop', 'Pink Lemonade', 'Flamingo Floss', 'Rosy Cheeks', 'Berry Kiss', 'Hot Pink Party'] },
  { id: 'reds', name: 'Reds', icon: 'berry', hue: 355, sat: 80,
    names: ['Cherry Blossom', 'Watermelon Ice', 'Candy Apple Fizz', 'Ladybug Love', 'Strawberry Jam', 'Cherry Pop', 'Lollipop Red', 'Rocket Pop', 'Ruby Slipper', 'Raspberry Royale'] },
  { id: 'oranges', name: 'Oranges', icon: 'citrus', hue: 25, sat: 90,
    names: ['Peach Fuzz', 'Apricot Cream', 'Mango Smoothie', 'Creamsicle', 'Tangerine Twist', 'Orange Soda', 'Pumpkin Pie', 'Clementine', 'Marmalade', 'Sunset Sizzle'] },
  { id: 'yellows', name: 'Yellows', icon: 'sun', hue: 48, sat: 95,
    names: ['Vanilla Custard', 'Butter Cream', 'Lemon Chiffon', 'Banana Split', 'Sunny Side Up', 'Honey Drop', 'Lemon Drop', 'Buttercup', 'Sunflower', 'Golden Honeycomb'] },
  { id: 'greens', name: 'Greens', icon: 'leaf', hue: 115, sat: 60,
    names: ['Minty Cloud', 'Pistachio Puff', 'Honeydew', 'Matcha Latte', 'Sour Apple', 'Lime Fizz', 'Clover Patch', 'Kiwi Crush', 'Froggy Hop', 'Jungle Gem'] },
  { id: 'aquas', name: 'Aquas', icon: 'drop', hue: 172, sat: 65,
    names: ['Sea Foam', 'Mermaid Mist', 'Lagoon Splash', 'Aqua Pop', 'Ocean Breeze', 'Pool Party', 'Turquoise Treat', 'Teal Jelly', 'Mermaid Tail', 'Deep Lagoon'] },
  { id: 'blues', name: 'Blues', icon: 'cloud', hue: 212, sat: 80,
    names: ['Cloud Nine', 'Baby Blue', 'Sky Puff', 'Blueberry Milk', 'Bluebell', 'Splash Zone', 'Denim Dream', 'Blue Raspberry', 'Starry Night', 'Midnight Berry'] },
  { id: 'purples', name: 'Purples', icon: 'grape', hue: 272, sat: 70,
    names: ['Lavender Mist', 'Lilac Dream', 'Unicorn Wish', 'Wisteria', 'Grape Soda', 'Violet Fizz', 'Purple Potion', 'Plum Pudding', 'Royal Grape', 'Galaxy Swirl'] },
  { id: 'neutrals', name: 'Neutrals', icon: 'cookie', hue: 30, sat: 22,
    names: ['Marshmallow', 'Vanilla Bean', 'Oat Milk', 'Sandcastle', 'Cookie Dough', 'Latte Foam', 'Caramel Drizzle', 'Cocoa Bean', 'Pebble Grey', 'Licorice'] },
  { id: 'pastels', name: 'Pastel Rainbow', icon: 'rainbow', rainbow: true,
    names: ['Rainbow Rose', 'Peachy Keen', 'Lemon Sherbet', 'Lime Sherbet', 'Mint Sherbet', 'Aqua Sherbet', 'Sky Sherbet', 'Periwinkle Puff', 'Lilac Sherbet', 'Orchid Sherbet'] },
]

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const f = (n) => {
    const k = (n + h / 30) % 12
    const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(c * 255).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

export const COLOR_FAMILIES = FAMILIES.map((fam) => ({
  id: fam.id,
  name: fam.name,
  icon: fam.icon,
  colors: fam.names.map((name, i) => {
    const hex = fam.rainbow
      ? hslToHex(i * 36, 85, 82) // pastel rainbow: one step around the color wheel each
      : fam.id === 'neutrals'
        ? hslToHex(i % 2 ? 25 : 35, fam.sat, 96 - i * 7.5)
        : hslToHex(fam.hue, fam.sat, 90 - i * 5.5)
    return { id: slug(name), name, hex, family: fam.id, icon: fam.icon }
  }),
}))

export const COLORS = COLOR_FAMILIES.flatMap((f) => f.colors)
export const colorById = (id) => COLORS.find((c) => c.id === id) ?? COLORS[0]

// Little Maker shows 20 colors at a time: two families per set.
export const LITTLE_SETS = [0, 2, 4, 6, 8].map((i) => [COLOR_FAMILIES[i], COLOR_FAMILIES[i + 1]])

// Ink or white, whichever reads better on the swatch (for its icon).
export function onColor(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.5 ? '#3b2a4a' : '#ffffff'
}
