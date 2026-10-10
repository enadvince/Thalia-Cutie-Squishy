# Thalia's Cutie Squishies

A cute, tactile squishy-maker game designed by Thalia. You build a squishy in 4 steps (Filling → Casing → Fill it → Play), then play with it. It works offline, has no ads, accounts or tracking, and nothing leaves the device.

## Run it

```bash
npm install
npm run dev          # open the URL on a phone/tablet on the same Wi-Fi with: npm run dev -- --host
```

Testing switches (URL only, until the parent gate arrives in Phase 7):
- `?platform=ios` or `?platform=android` forces a platform's look
- `?mode=big` or `?mode=little` picks Big Maker or Little Maker

## Verify a phase

```bash
npm run build
npx vite preview --port 4173 &
npm run verify       # screenshots land in verify-out/
```

`verify` renders every screen on iPhone, Pixel, iPad (landscape) and Android-tablet (landscape) profiles, at 200% text, and with reduced motion. It fails on: undersized touch targets, unnamed controls, text under 16px, horizontal scrolling, axe WCAG AA violations, page errors, or system back not returning to the title.

## Where things live

- `src/data/*.js`: all game content: steps, modes, fillings, add-ons, colors (100, generated from 10 families), sprays, scents, casing types, shapes, stickers. Add options here without touching components.
- `src/components/AddonArt.jsx`: the drawing for each add-on (an add-on's `art` key in `addons.js` points here).
- `src/styles/tokens.css`: candy palette, M3 color roles, iOS roles, motion and size tokens.
- `src/components/`: platform-adaptive chrome (`AppBar`, `Buttons`, `StepTabs`) and the `Mascot`.
- `src/state/GameContext.jsx`: React context + autosave to `localStorage`, with Undo history.
- `GUIDELINES.md`: HIG/M3 checklist, signed off at the end of each phase.
- `RESEARCH.md`: Mobbin/Watermelon pattern summary.

## Adding a sticker

1. Drop a square image with a transparent background (SVG or PNG) into `public/assets/stickers/`.
2. Add one line to `src/data/stickers.js`:
   ```js
   { id: 'my-sticker', name: 'My Sticker', image: 'my-sticker.svg', unlock: 'starter' },
   ```
   Use `unlock: { stars: 10 }` instead to show it as a locked silhouette ("Coming soon!") until 10 stars are earned (stars arrive in Phase 6).

## Build phases

1. ✅ Setup, design tokens, title screen, 4-step stepper shell, research summary
2. ✅ Step 1: filling + live preview jar
3. ✅ Step 2: casing, sprays, scents, locked stickers
4. Step 3: fill interaction
5. Step 4: play physics + sounds
6. Shelf, stars, badges, unlocks, daily surprise
7. Guardrails, parent gate, PWA/offline, accessibility pass
8. Higgsfield asset pass + polish
