// Motion presets per platform.
// iOS: spring approximating UIKit's default (response 0.55s, damping 0.825).
// Android: M3 emphasized-decelerate easing at medium2 (300ms).
export const transitions = {
  ios: {
    page: { type: 'spring', stiffness: 130, damping: 19 },
    pill: { type: 'spring', stiffness: 380, damping: 30, mass: 0.9 },
  },
  android: {
    page: { duration: 0.3, ease: [0.05, 0.7, 0.1, 1] },
    pill: { duration: 0.3, ease: [0.2, 0, 0, 1] },
  },
}

// Playful bounce for the custom game look (play area + artwork only).
export const bouncy = { type: 'spring', stiffness: 500, damping: 15 }
