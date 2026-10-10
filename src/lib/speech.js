// Read-aloud via the Web Speech API. Silently does nothing where unsupported.
export const canSpeak = () => 'speechSynthesis' in window

export function speak(text) {
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.95
  u.pitch = 1.15
  window.speechSynthesis.speak(u)
}

// iOS only allows speech that starts from a tap. Call this inside a tap handler
// (the Play button) so later automatic read-aloud is allowed.
export function unlockSpeech() {
  if (canSpeak()) window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
}
