// Light, one-shot haptic tick. Never continuous. iOS Safari has no vibrate API, so this no-ops there.
export function tick() {
  if ('vibrate' in navigator) navigator.vibrate(10)
}
