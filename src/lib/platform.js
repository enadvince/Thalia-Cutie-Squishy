// Detects which platform's chrome to render: 'ios' or 'android'.
// Desktop/unknown browsers get Material 3, which is designed for the web too.
// For testing, ?platform=ios or ?platform=android overrides detection.
export function detectPlatform() {
  const forced = new URLSearchParams(window.location.search).get('platform')
  if (forced === 'ios' || forced === 'android') return forced

  const ua = navigator.userAgent
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  if (/iPhone|iPad|iPod/.test(ua) || isIPadOS) return 'ios'
  return 'android'
}

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
