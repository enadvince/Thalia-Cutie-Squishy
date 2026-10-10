// Sticker designs for Sticker Spray.
//
// To add a sticker: drop an image (SVG or PNG, square, transparent background) into
// public/assets/stickers/ and add an entry below. That's it — no component changes.
//   unlock: 'starter'      → available from the start
//   unlock: { stars: N }   → shown as a locked silhouette ("Coming soon!") until N stars are earned
export const STICKERS = [
  { id: 'strawberry-smile', name: 'Strawberry Smile', image: 'strawberry-smile.svg', unlock: 'starter' },
  { id: 'rainbow-cloud', name: 'Rainbow Cloud', image: 'rainbow-cloud.svg', unlock: 'starter' },
  { id: 'happy-star', name: 'Happy Star', image: 'happy-star.svg', unlock: 'starter' },
  { id: 'ice-cream-pal', name: 'Ice Cream Pal', image: 'ice-cream-pal.svg', unlock: 'starter' },
  { id: 'moon-bunny', name: 'Moon Bunny', image: 'moon-bunny.svg', unlock: 'starter' },
  { id: 'boba-buddy', name: 'Boba Buddy', image: 'boba-buddy.svg', unlock: 'starter' },
  { id: 'donut-dream', name: 'Donut Dream', image: 'donut-dream.svg', unlock: 'starter' },
  { id: 'cactus-cutie', name: 'Cactus Cutie', image: 'cactus-cutie.svg', unlock: 'starter' },
  { id: 'whale-wave', name: 'Whale Wave', image: 'whale-wave.svg', unlock: 'starter' },
  { id: 'mystery-circle', name: 'Mystery Sticker', image: 'mystery-circle.svg', unlock: { stars: 5 } },
]

export const stickerSrc = (sticker) => `${import.meta.env.BASE_URL}assets/stickers/${sticker.image}`

export const isStickerUnlocked = (sticker, stars = 0) =>
  sticker.unlock === 'starter' || stars >= sticker.unlock.stars

export const stickerById = (id) => STICKERS.find((s) => s.id === id)
export const FIRST_STARTER = STICKERS.find((s) => s.unlock === 'starter')
