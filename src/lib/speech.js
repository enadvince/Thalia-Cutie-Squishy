// Read-aloud via the Web Speech API. Silently does nothing where unsupported.
export const canSpeak = () => 'speechSynthesis' in window

// American English voices only, in order of preference: natural/neural voices first (warmest,
// least robotic), then Apple's downloaded high-quality voices, then well-known US voices.
const PREFERRED = [
  /(natural|neural)/i, // Microsoft Edge "… Online (Natural)" (Aria, Jenny, Ana…)
  /(premium|enhanced)/i, // Apple's downloaded high-quality voices
  /google us english/i, // Chrome / Android
  /(samantha|ava|allison|susan|zoe|nicky|joelle)/i, // Apple US voices
  /(aria|jenny|ana|zira)/i, // Windows US voices
]
// Apple's novelty and low-quality "compact" voices sound robotic: never pick them.
const AVOID = /(compact|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley)/i

// Words the speech engines tend to say wrong, respelled the way they sound (speech only).
const SAY_LIKE = [
  [/\bbeads\b/gi, 'beeds'],
  [/\bbead\b/gi, 'beed'],
  [/\bdough\b/gi, 'doe'],
]

let voice
function pickVoice() {
  if (voice !== undefined) return voice
  const all = window.speechSynthesis.getVoices()
  if (!all.length) return null // voices still loading; try again next time
  const us = all.filter((v) => /^en[-_]US/i.test(v.lang) && !AVOID.test(v.name))
  voice = null
  for (const pattern of PREFERRED) {
    voice = us.find((v) => pattern.test(v.name))
    if (voice) break
  }
  voice ??= us.find((v) => v.localService) ?? us[0] ?? all.find((v) => /^en/i.test(v.lang)) ?? null
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
  u.lang = u.lang || 'en-US'
  u.rate = 1 // natural speed; a raised pitch is what made it sound robotic
  u.pitch = 1.05
  window.speechSynthesis.speak(u)
}

// iOS only allows speech that starts from a tap. Call this inside a tap handler
// (the Play button) so later automatic read-aloud is allowed.
export function unlockSpeech() {
  if (canSpeak()) window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
}
