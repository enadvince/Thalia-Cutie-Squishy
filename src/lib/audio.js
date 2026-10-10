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
