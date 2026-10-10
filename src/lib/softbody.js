// Soft-body squishy: an (n+1)×(n+1) grid of points over the squishy picture (coordinates 0–1).
// Each point is a spring pulling it back to its rest spot; fingers push and pull nearby points
// with a smooth falloff, so the picture bends like jelly. Putty can move a point's rest spot (a dent that stays).
const GRAB_STIFFNESS = 600 // how firmly points follow a finger
const RADIUS = 0.16 // finger influence radius
const POKE_RADIUS = 0.1
const DENT_RADIUS = 0.08 // a press dents just the spot under the finger…
const KEEP_RADIUS = 0.11 // …and a moldable squishy keeps a dent a little wider than the fingertip
const SQUASH = 0.35 // …while the whole squishy spreads a little wider and shorter
const FLOOR = 0.9 // where the squishy sits (it squashes down toward here)
const MAX_DENT = 0.12 // furthest a Putty dent can move a rest spot
const SUBSTEP = 1 / 240

export class SoftBody {
  constructor(n, physics) {
    this.n = n
    this.physics = physics
    const count = (n + 1) * (n + 1)
    this.home = new Float32Array(count * 2) // original grid (also the texture coordinates)
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        const v = j * (n + 1) + i
        this.home[v * 2] = i / n
        this.home[v * 2 + 1] = j / n
      }
    }
    this.rest = Float32Array.from(this.home)
    this.pos = Float32Array.from(this.home)
    this.vel = new Float32Array(count * 2)
    this.shade = new Float32Array(count).fill(1)
    this.stress = new Float32Array(count) // pale stretch marks (plastic), fading over time
    this.grabs = new Map()
    this.restArea = 1 / (n * n)
  }

  weights(x, y, radius) {
    const w = new Float32Array(this.rest.length / 2)
    const s = 2 * radius * radius
    for (let v = 0; v < w.length; v++) {
      const dx = this.rest[v * 2] - x
      const dy = this.rest[v * 2 + 1] - y
      w[v] = Math.exp(-(dx * dx + dy * dy) / s)
    }
    return w
  }

  // A finger touches down. Holding still presses a dent; moving stretches.
  grab(id, x, y) {
    this.grabs.set(id, {
      x0: x,
      y0: y,
      x,
      y,
      age: 0,
      moved: false,
      w: this.weights(x, y, RADIUS),
      dent: this.weights(x, y, DENT_RADIUS),
    })
  }

  move(id, x, y) {
    const g = this.grabs.get(id)
    if (!g) return
    g.x = x
    g.y = y
    if (Math.hypot(x - g.x0, y - g.y0) > 0.03) g.moved = true
  }

  // Returns what the finger did ('poke' for a quick tap, else 'press' or 'stretch').
  release(id) {
    const g = this.grabs.get(id)
    if (!g) return null
    this.grabs.delete(id)
    const { plasticity } = this.physics
    if (plasticity > 0) {
      // Putty keeps part of the dent (or stretch): move rest spots toward where the points are now.
      const keep = g.moved ? g.w : this.weights(g.x, g.y, KEEP_RADIUS)
      for (let v = 0; v < keep.length; v++) {
        for (let a = 0; a < 2; a++) {
          const k = v * 2 + a
          const moved = this.rest[k] + plasticity * keep[v] * (this.pos[k] - this.rest[k])
          this.rest[k] = this.home[k] + clamp(moved - this.home[k], -MAX_DENT, MAX_DENT)
        }
      }
    }
    if (!g.moved && g.age < 0.2) {
      this.tap(g.x, g.y)
      return 'poke'
    }
    return g.moved ? 'stretch' : 'press'
  }

  // A quick inward flick around (x, y).
  poke(x, y, strength = 9) {
    const w = this.weights(x, y, POKE_RADIUS)
    for (let v = 0; v < w.length; v++) {
      this.vel[v * 2] += (x - this.pos[v * 2]) * w[v] * strength
      this.vel[v * 2 + 1] += (y - this.pos[v * 2 + 1]) * w[v] * strength
    }
  }

  // How far apart two fingers are now compared with when they touched down (1 = same).
  spread() {
    const [a, b] = [...this.grabs.values()]
    if (!a || !b) return 1
    const start = Math.hypot(a.x0 - b.x0, a.y0 - b.y0) || 0.01
    return Math.hypot(a.x - b.x, a.y - b.y) / start
  }

  // A quick tap: a dimple where the finger landed plus a little whole-body squash-bounce.
  tap(x, y) {
    this.poke(x, y, 18)
    for (let v = 0; v < this.vel.length / 2; v++) {
      this.vel[v * 2] += (this.home[v * 2] - 0.5) * 0.9
      this.vel[v * 2 + 1] += (FLOOR - this.home[v * 2 + 1]) * 1.3
    }
  }

  // Wobble everything; also smooths Putty dents back out.
  shake(strength = 1) {
    for (let v = 0; v < this.vel.length / 2; v++) {
      const dx = this.home[v * 2] - 0.5
      const dy = this.home[v * 2 + 1] - 0.5
      this.vel[v * 2] += (Math.random() - 0.5) * 0.6 * strength - dy * 1.5 * strength
      this.vel[v * 2 + 1] += (Math.random() - 0.5) * 0.6 * strength + dx * 1.5 * strength
    }
    for (let k = 0; k < this.rest.length; k++) this.rest[k] += (this.home[k] - this.rest[k]) * 0.5
  }

  // Where each grabbed point wants to go, blended by how close it is to the finger(s).
  target(grabs, v, axis) {
    const restV = this.rest[v * 2 + axis]
    if (grabs.length === 0) return null
    const { stretch, press } = this.physics
    let sum = 0
    let weight = 0
    if (grabs.length >= 2) {
      // Two fingers: each pulls its own side along (apart = stretch, together = squeeze).
      // Fingers that haven't moved yet gently pinch toward the middle.
      const two = grabs.slice(0, 2)
      const mid = ((axis ? two[0].y : two[0].x) + (axis ? two[1].y : two[1].x)) / 2
      for (const g of two) {
        let goal
        if (g.moved) {
          const d = (axis ? g.y - g.y0 : g.x - g.x0) * 1.1
          goal = restV + Math.max(-stretch * 1.3, Math.min(stretch * 1.3, d))
        } else goal = restV + (mid - restV) * 0.3
        sum += g.w[v] * goal
        weight += g.w[v]
      }
    } else {
      const g = grabs[0]
      if (g.moved) {
        let dx = g.x - g.x0
        let dy = g.y - g.y0
        const len = Math.hypot(dx, dy)
        if (len > stretch) {
          dx = (dx / len) * stretch
          dy = (dy / len) * stretch
        }
        sum = g.w[v] * (restV + (axis ? dy : dx))
        weight = g.w[v]
      } else {
        // Press: squash the whole squishy a little, and dent the spot under the finger.
        const depth = Math.min(1, g.age / 0.35) * press
        const squash = depth * SQUASH
        const spread = axis ? FLOOR + (restV - FLOOR) * (1 - squash) : 0.5 + (restV - 0.5) * (1 + squash * 0.8)
        const p = axis ? g.y : g.x
        // Moldable textures sink in deeper under the finger.
        let goal = spread + g.dent[v] * (p - restV) * depth * (1.6 + 1.6 * this.physics.plasticity)
        if (this.physics.bulge) {
          // Balloon: a ring of surface bubbles up around the finger, growing the longer you hold.
          const rx = this.rest[v * 2] - g.x
          const ry = this.rest[v * 2 + 1] - g.y
          const d = Math.hypot(rx, ry) || 1e-6
          const ring = Math.exp(-((d - 0.14) ** 2) / (2 * 0.035 ** 2))
          goal += ((axis ? ry : rx) / d) * ring * this.physics.bulge * Math.min(1, g.age / 1.2)
        }
        return { goal, weight: 1 }
      }
    }
    return weight > 0.002 ? { goal: sum / weight, weight: Math.min(1, weight) } : null
  }

  step(dt) {
    dt = Math.min(dt, 0.05)
    for (const g of this.grabs.values()) g.age += dt
    const { k, damping } = this.physics
    const grabs = [...this.grabs.values()]
    for (let t = 0; t < dt; t += SUBSTEP) {
      for (let v = 0; v < this.vel.length / 2; v++) {
        for (let a = 0; a < 2; a++) {
          const i = v * 2 + a
          let force = -k * (this.pos[i] - this.rest[i]) - damping * this.vel[i]
          const tg = grabs.length ? this.target(grabs, v, a) : null
          if (tg) force += GRAB_STIFFNESS * tg.weight * (tg.goal - this.pos[i]) - 20 * tg.weight * this.vel[i]
          this.vel[i] += force * SUBSTEP
          this.pos[i] += this.vel[i] * SUBSTEP
        }
      }
    }
    if (this.physics.recover) {
      // The casing slowly pulls molded spots back to the original shape.
      const back = 1 - Math.exp(-dt * this.physics.recover)
      for (let k = 0; k < this.rest.length; k++) this.rest[k] += (this.home[k] - this.rest[k]) * back
    }
    if (this.physics.stress) {
      const fade = Math.exp(-dt / 1.8)
      for (let v = 0; v < this.stress.length; v++) this.stress[v] *= fade
    }
    this.updateShade()
  }

  // Squeezed areas get darker (a dent), stretched areas a touch lighter.
  updateShade() {
    const n = this.n
    const row = n + 1
    this.shade.fill(0)
    const counts = new Float32Array(this.shade.length)
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = j * row + i
        const b = a + 1
        const c = a + row + 1
        const d = a + row
        const area = Math.abs(quadArea(this.pos, a, b, c, d))
        const s = clamp(1 - (1 - area / this.restArea) * 0.5, 0.68, 1.08)
        for (const v of [a, b, c, d]) {
          this.shade[v] += s
          counts[v] += 1
        }
      }
    }
    for (let v = 0; v < this.shade.length; v++) {
      this.shade[v] /= counts[v]
      if (this.physics.stress) {
        // Plastic: stretched spots go pale and fade back slowly.
        const stretched = Math.max(0, (this.shade[v] - 1) / 0.08) // 0–1 from the stretch shading
        this.stress[v] = Math.max(this.stress[v], stretched)
        this.shade[v] += this.stress[v] * 0.35
      }
    }
  }

  // Where a point of the original picture (u, v in 0–1) is now, following the bent grid.
  map(u, v) {
    const n = this.n
    const fi = clamp(u * n, 0, n - 0.0001)
    const fj = clamp(v * n, 0, n - 0.0001)
    const i = Math.floor(fi)
    const j = Math.floor(fj)
    const tx = fi - i
    const ty = fj - j
    const row = n + 1
    const a = (j * row + i) * 2
    const b = a + 2
    const d = a + row * 2
    const c = d + 2
    const lerp = (o) =>
      (this.pos[a + o] * (1 - tx) + this.pos[b + o] * tx) * (1 - ty) + (this.pos[d + o] * (1 - tx) + this.pos[c + o] * tx) * ty
    return [lerp(0), lerp(1)]
  }

  // How far the shape is from its rest shape (0 = settled).
  energy() {
    let e = 0
    for (let i = 0; i < this.pos.length; i++) e += Math.abs(this.pos[i] - this.rest[i]) + Math.abs(this.vel[i]) * 0.1
    return e / this.pos.length
  }
}

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x))

function quadArea(p, a, b, c, d) {
  const x = (v) => p[v * 2]
  const y = (v) => p[v * 2 + 1]
  return 0.5 * ((x(a) * y(b) - x(b) * y(a)) + (x(b) * y(c) - x(c) * y(b)) + (x(c) * y(d) - x(d) * y(c)) + (x(d) * y(a) - x(a) * y(d)))
}
