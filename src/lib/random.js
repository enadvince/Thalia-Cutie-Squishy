// Small deterministic random from a string seed, so scattered decorations stay put between renders.
export function seeded(str) {
  let h = 2166136261
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h >>>= 0) % 10000) / 10000
  }
}

// React's useId() can contain characters that aren't valid in SVG ids (and break url(#id)
// when an SVG is turned into an image). Keep letters, digits, - and _.
export const safeId = (id) => `u${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
