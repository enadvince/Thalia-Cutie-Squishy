// Synthesized sounds via Web Audio (no audio files, no licensing).
// Master volume is capped so the game is never loud.
const MAX_VOLUME = 0.35

let ctx = null
let master = null
let muted = false

function audio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    master = ctx.createGain()
    master.gain.value = MAX_VOLUME
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setMuted(value) {
  muted = value
}

// A soft bubbly "pop": a quick downward pitch sweep.
export function pop(pitch = 1) {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(620 * pitch, t)
  osc.frequency.exponentialRampToValueAtTime(180 * pitch, t + 0.12)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.8, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
  osc.connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + 0.18)
}

// A short happy jingle (rising major arpeggio) for finishing a step.
export function jingle() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    const start = t + i * 0.11
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
    osc.connect(gain).connect(master)
    osc.start(start)
    osc.stop(start + 0.4)
  })
}

let noise = null
function noiseBuffer(ac) {
  if (!noise) {
    noise = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noise
}

// A wet little "squelch": filtered noise with a falling filter. `level` 0–1 raises the pitch as it fills.
export function squelch(level = 0) {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 6
  filter.frequency.setValueAtTime(700 + level * 700, t)
  filter.frequency.exponentialRampToValueAtTime(220 + level * 200, t + 0.13)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.9, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
  src.connect(filter).connect(gain).connect(master)
  src.start(t)
  src.stop(t + 0.16)
}

// Twinkly chimes for "it's full!".
export function sparkle() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  ;[1568, 2093, 2637, 3136].forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    const start = t + i * 0.07
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
    osc.connect(gain).connect(master)
    osc.start(start)
    osc.stop(start + 0.55)
  })
}

// A springy "boing" for overfilling (a happy jiggle, never a mistake).
export function boing() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const wobble = ac.createOscillator()
  const wobbleDepth = ac.createGain()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(180, t)
  osc.frequency.exponentialRampToValueAtTime(420, t + 0.25)
  wobble.frequency.value = 18
  wobbleDepth.gain.value = 40
  wobble.connect(wobbleDepth).connect(osc.frequency)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.6, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
  osc.connect(gain).connect(master)
  osc.start(t)
  wobble.start(t)
  osc.stop(t + 0.42)
  wobble.stop(t + 0.42)
}

// A dry crunchy crackle: a quick run of tiny noise clicks.
export function crackle() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  for (let i = 0; i < 7; i++) {
    const start = t + i * 0.025 + Math.random() * 0.015
    const src = ac.createBufferSource()
    src.buffer = noiseBuffer(ac)
    const filter = ac.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 2200 + Math.random() * 2500
    const gain = ac.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.7, start + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.02)
    src.connect(filter).connect(gain).connect(master)
    src.start(start, Math.random() * 0.2)
    src.stop(start + 0.03)
  }
}

// A deep, bassy crunch (Crunchy): low thump plus a run of low, chunky noise grains.
export function crunch() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const thump = ac.createOscillator()
  const tg = ac.createGain()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(110, t)
  thump.frequency.exponentialRampToValueAtTime(55, t + 0.12)
  tg.gain.setValueAtTime(0.0001, t)
  tg.gain.exponentialRampToValueAtTime(0.9, t + 0.01)
  tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
  thump.connect(tg).connect(master)
  thump.start(t)
  thump.stop(t + 0.18)
  for (let i = 0; i < 6; i++) {
    const start = t + i * 0.03 + Math.random() * 0.02
    const src = ac.createBufferSource()
    src.buffer = noiseBuffer(ac)
    const filter = ac.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 2.5
    filter.frequency.value = 280 + Math.random() * 450
    const gain = ac.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(1, start + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05)
    src.connect(filter).connect(gain).connect(master)
    src.start(start, Math.random() * 0.2)
    src.stop(start + 0.06)
  }
}

// Water beads rolling and squeezing: a little cluster of round, wet "plip"s.
export function plip(amount = 0.5) {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const count = 3 + Math.round(amount * 3)
  for (let i = 0; i < count; i++) {
    const start = t + i * 0.035 + Math.random() * 0.025
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    const f = 700 + Math.random() * 700
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, start)
    osc.frequency.exponentialRampToValueAtTime(f * 1.9, start + 0.035) // rising = drippy, watery
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.05)
    osc.connect(gain).connect(master)
    osc.start(start)
    osc.stop(start + 0.06)
  }
}

// One bubble-wrap bubble popping: a sharp little snap of air.
export function snap() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.value = 1300 + Math.random() * 900
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(1, t + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)
  src.connect(filter).connect(gain).connect(master)
  src.start(t, Math.random() * 0.2)
  src.stop(t + 0.05)
  pop(1.6 + Math.random() * 0.4)
}

// A soft, slow "fwoomp" of air (slow-rising foam, butter slime).
export function swish() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(300, t)
  filter.frequency.linearRampToValueAtTime(900, t + 0.12)
  filter.frequency.linearRampToValueAtTime(250, t + 0.28)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.8, t + 0.08)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
  src.connect(filter).connect(gain).connect(master)
  src.start(t)
  src.stop(t + 0.3)
}

// A soft low thud (dough).
export function thud() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, t)
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.15)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.9, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
  osc.connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + 0.2)
}

// A stretchy rubbery squeak; `amount` 0–1 bends the pitch up.
export function squeak(amount = 0.5) {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const filter = ac.createBiquadFilter()
  const gain = ac.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(320 + amount * 200, t)
  osc.frequency.exponentialRampToValueAtTime(520 + amount * 500, t + 0.18)
  filter.type = 'lowpass'
  filter.frequency.value = 1400
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
  osc.connect(filter).connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + 0.22)
}

// Crisp plastic clicks (Clicker): a couple of short bright ticks.
export function click() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  ;[0, 0.045].forEach((d, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    const start = t + d + Math.random() * 0.01
    osc.type = 'square'
    osc.frequency.setValueAtTime(2400 - i * 500 + Math.random() * 300, start)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.025)
    osc.connect(gain).connect(master)
    osc.start(start)
    osc.stop(start + 0.03)
  })
}

// Soft, airy whipped-cream "shff" with tiny bubbles (Liquid Foam).
export function cream() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac)
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.setValueAtTime(1800, t)
  filter.frequency.linearRampToValueAtTime(900, t + 0.25)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.45, t + 0.05)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
  src.connect(filter).connect(gain).connect(master)
  src.start(t)
  src.stop(t + 0.3)
  for (let i = 0; i < 3; i++) setTimeout(() => gloop(0.9), 40 + i * 70)
}

// A low waxy creak (Wax): a slow wobbly tone.
export function creak() {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const filter = ac.createBiquadFilter()
  const gain = ac.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(110, t)
  osc.frequency.linearRampToValueAtTime(150, t + 0.25)
  filter.type = 'lowpass'
  filter.frequency.value = 600
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.25, t + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
  osc.connect(filter).connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + 0.32)
}

// A smooth rubbery stretch for two-finger pulls: a gliding tone whose pitch follows the stretch
// (`amount` 0–1), rising as fingers pull apart and falling as they squeeze together.
export function rubber(amount = 0.5, rising = true) {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const wobble = ac.createOscillator()
  const depth = ac.createGain()
  const filter = ac.createBiquadFilter()
  const gain = ac.createGain()
  const f = 180 + amount * 260
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(rising ? f * 0.85 : f * 1.15, t)
  osc.frequency.exponentialRampToValueAtTime(f, t + 0.16)
  wobble.frequency.value = 9
  depth.gain.value = 6
  wobble.connect(depth).connect(osc.frequency)
  filter.type = 'lowpass'
  filter.frequency.value = 900
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.32, t + 0.03)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
  osc.connect(filter).connect(gain).connect(master)
  osc.start(t)
  wobble.start(t)
  osc.stop(t + 0.22)
  wobble.stop(t + 0.22)
}

// Plays a named sound from a filling's `sounds` config.
const NAMED = {
  crackle,
  crunch,
  plip: (amount) => plip(amount),
  click,
  cream,
  creak,
  swish,
  thud,
  squelch: (amount) => squelch(amount),
  squeak: (amount) => squeak(amount),
  pop: () => pop(1.1),
}
export const playNamed = (name, amount) => NAMED[name]?.(amount)

// A round bubbly "gloop" as filling pours in; `level` 0–1 raises it as the squishy fills.
export function gloop(level = 0) {
  if (muted) return
  const ac = audio()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const filter = ac.createBiquadFilter()
  const gain = ac.createGain()
  const base = 160 + level * 160 + Math.random() * 40
  osc.type = 'sine'
  osc.frequency.setValueAtTime(base, t)
  osc.frequency.exponentialRampToValueAtTime(base * 2.6, t + 0.09)
  filter.type = 'lowpass'
  filter.frequency.value = 1200
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.85, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
  osc.connect(filter).connect(gain).connect(master)
  osc.start(t)
  osc.stop(t + 0.16)
}
