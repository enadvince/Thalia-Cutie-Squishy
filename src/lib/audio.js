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
