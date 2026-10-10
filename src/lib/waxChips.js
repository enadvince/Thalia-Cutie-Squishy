import { seeded } from './random'

// The Wax casing's coat, cut into irregular chips laid over the squishy (coordinates 0–1, like the
// soft body). Neighboring chips share jittered corners, so the coat starts seamless. A hit cracks a
// chip (it shifts a little and darkens); the next hit, or a shake, knocks it off and it tumbles away.
const FALL_TIME = 1 // seconds a falling chip takes to fade out

export function makeChips(n = 8, seed = 'wax') {
  const rand = seeded(seed)
  const row = n + 1
  const pts = []
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const edge = i === 0 || j === 0 || i === n || j === n
      pts.push([i / n + (edge ? 0 : (rand() - 0.5) * 0.6 / n), j / n + (edge ? 0 : (rand() - 0.5) * 0.6 / n)])
    }
  }
  const chips = []
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const corners = [pts[j * row + i], pts[j * row + i + 1], pts[(j + 1) * row + i + 1], pts[(j + 1) * row + i]]
      chips.push({
        uv: corners.flat(),
        cx: corners.reduce((s, p) => s + p[0], 0) / 4,
        cy: corners.reduce((s, p) => s + p[1], 0) / 4,
        need: rand() < 0.5 ? 1 : 2, // some chips pop off on the first hit
        hits: 0,
        crack: [(rand() - 0.5) * 0.014, (rand() - 0.5) * 0.014],
        fall: null,
      })
    }
  }
  return chips
}

const breakOff = (c, fromX, fromY) => {
  const dx = c.cx - fromX
  const dy = c.cy - fromY
  c.fall = { t: 0, x: 0, y: 0, vx: dx * 2 + (Math.random() - 0.5) * 0.3, vy: -0.35 + dy, rot: 0, vr: (Math.random() - 0.5) * 8 }
}

// A finger (or button) hits the coat at (x, y). Returns 'break', 'crack' or null for sounds.
export function hitChips(chips, x, y, radius = 0.11) {
  let result = null
  for (const c of chips) {
    if (c.fall || Math.hypot(c.cx - x, c.cy - y) > radius) continue
    c.hits += 1
    if (c.hits >= c.need) {
      breakOff(c, x, y)
      result = 'break'
    } else result ??= 'crack'
  }
  return result
}

// A shake knocks off a few random chips (cracked ones first).
export function shakeChips(chips, count = 5) {
  const left = chips.filter((c) => !c.fall).sort((a, b) => b.hits - a.hits || Math.random() - 0.5)
  left.slice(0, count).forEach((c) => breakOff(c, 0.5, 0.5))
  return left.length ? 'break' : null
}

export function updateChips(chips, dt) {
  for (const c of chips) {
    if (!c.fall) continue
    const f = c.fall
    f.t += dt
    f.vy += 2.4 * dt // gravity
    f.x += f.vx * dt
    f.y += f.vy * dt
    f.rot += f.vr * dt
  }
}

// Quads for the renderer: intact chips follow the bent squishy; falling ones tumble and fade.
export function chipQuads(chips, body) {
  const quads = []
  for (const c of chips) {
    if (c.fall && c.fall.t > FALL_TIME) continue
    const pts = []
    for (let k = 0; k < 4; k++) pts.push(body.map(c.uv[k * 2], c.uv[k * 2 + 1]))
    let ox = 0
    let oy = 0
    if (c.hits && !c.fall) [ox, oy] = c.crack
    const corners = []
    if (c.fall) {
      const [mx, my] = body.map(c.cx, c.cy)
      const cos = Math.cos(c.fall.rot)
      const sin = Math.sin(c.fall.rot)
      for (const [px, py] of pts) {
        const dx = px - mx
        const dy = py - my
        corners.push(mx + dx * cos - dy * sin + c.fall.x, my + dx * sin + dy * cos + c.fall.y)
      }
    } else for (const [px, py] of pts) corners.push(px + ox, py + oy)
    quads.push({
      corners,
      uv: c.uv,
      shade: c.hits && !c.fall ? 0.9 : 1,
      alpha: c.fall ? Math.max(0, 1 - c.fall.t / FALL_TIME) : 1,
    })
  }
  return quads
}
