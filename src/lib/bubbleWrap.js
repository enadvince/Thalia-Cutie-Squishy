import { BUBBLES, BUBBLE_R } from '../components/SquishyView'

// Bubble Wrap in Play: every bubble on the casing is its own little quad (coordinates 0–1, like the
// soft body). Pressing or rubbing over a bubble pops it: it flattens and fades, leaving the flat ring
// drawn on the casing underneath.
const POP_TIME = 0.14 // seconds a popping bubble takes to flatten
const HALF = (BUBBLE_R + 1.5) / 280

// `image` is the bubbles layer; bubbles outside the shape (fully clear there) are left out.
export function makeBubbles(image) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(image, 0, 0, size, size)
  const alpha = ctx.getImageData(0, 0, size, size).data
  const inside = (u, v) => alpha[(Math.min(size - 1, Math.floor(v * size)) * size + Math.min(size - 1, Math.floor(u * size))) * 4 + 3] > 20
  return BUBBLES.map(([x, y]) => ({ u: (x + 10) / 280, v: (y + 20) / 280, popped: null }))
    .filter((b) => b.u > 0 && b.u < 1 && b.v > 0 && b.v < 1 && inside(b.u, b.v))
}

// Pops the bubbles near (x, y); returns how many popped.
export function popBubbles(bubbles, x, y, radius = 0.055) {
  let count = 0
  for (const b of bubbles) {
    if (b.popped !== null || Math.hypot(b.u - x, b.v - y) > radius) continue
    b.popped = 0
    count += 1
  }
  return count
}

export function updateBubbles(bubbles, dt) {
  for (const b of bubbles) if (b.popped !== null) b.popped += dt
}

// Quads for the renderer: bubbles follow the bent squishy; popping ones shrink flat and fade.
export function bubbleQuads(bubbles, body) {
  const quads = []
  for (const b of bubbles) {
    if (b.popped !== null && b.popped > POP_TIME) continue
    const t = b.popped === null ? 0 : b.popped / POP_TIME
    const uv = [b.u - HALF, b.v - HALF, b.u + HALF, b.v - HALF, b.u + HALF, b.v + HALF, b.u - HALF, b.v + HALF]
    const [cx, cy] = body.map(b.u, b.v)
    const shrink = 1 - t * 0.35
    const corners = []
    for (let k = 0; k < 4; k++) {
      const [px, py] = body.map(uv[k * 2], uv[k * 2 + 1])
      corners.push(cx + (px - cx) * shrink, cy + (py - cy) * shrink)
    }
    quads.push({ corners, uv, shade: 1, alpha: 1 - t })
  }
  return quads
}
