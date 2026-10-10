// Read-aloud via the Web Speech API. Silently does nothing where unsupported.
export const canSpeak = () => 'speechSynthesis' in window

// Voices in order of preference: natural/neural voices first (clearest), then well-known
// friendly English voices on each platform. The first one the device has wins.
const PREFERRED = [
  /natural/i, // Microsoft Edge "… Online (Natural)" voices
  /(enhanced|premium)/i, // Apple's downloaded high-quality voices
  /google us english/i, // Chrome / Android
  /samantha/i, // iOS / macOS
  /\bava\b/i,
  /(jenny|aria|zira)/i, // Windows
  /(karen|serena|tessa|moira)/i,
]

// Words the speech engines tend to say wrong, respelled the way they sound (speech only).
const SAY_LIKE = [
  [/\bbeads\b/gi, 'beeds'],
  [/\bbead\b/gi, 'beed'],
  [/\bdough\b/gi, 'doe'],
]

let voice
function pickVoice() {
  if (voice !== undefined) return voice
  const english = window.speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang))
  if (!english.length) return null // voices still loading; try again next time
  voice = null
  for (const pattern of PREFERRED) {
    voice = english.find((v) => pattern.test(v.name) && /^en-(US|GB|AU)/i.test(v.lang)) ?? english.find((v) => pattern.test(v.name))
    if (voice) break
  }
  voice ??= english.find((v) => v.default) ?? english[0]
  return voice
}
if (canSpeak()) window.speechSynthesis.addEventListener?.('voiceschanged', () => (voice = undefined))

export function speak(text) {
  if (!canSpeak() || !text) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(SAY_LIKE.reduce((t, [word, sound]) => t.replace(word, sound), text))
  const v = pickVoice()
  if (v) {
    u.voice = v
    u.lang = v.lang
  }
  u.rate = 1.05 // a little brighter and bouncier than default
  u.pitch = 1.25
  window.speechSynthesis.speak(u)
}

// iOS only allows speech that starts from a tap. Call this inside a tap handler
// (the Play button) so later automatic read-aloud is allowed.
export function unlockSpeech() {
  if (canSpeak()) window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
}
