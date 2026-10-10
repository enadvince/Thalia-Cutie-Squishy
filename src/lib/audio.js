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
