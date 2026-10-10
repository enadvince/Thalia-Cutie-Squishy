# Thalia's Cutie Squishies

A cute, tactile squishy-maker game designed by Thalia. You build a squishy in 4 steps (Filling → Casing → Fill it → Play), then play with it. It works offline, has no ads, accounts or tracking, and nothing leaves the device.

## Run it

```bash
npm install
npm run dev          # open the URL on a phone/tablet on the same Wi-Fi with: npm run dev -- --host
```

Testing switch: `?platform=ios` or `?platform=android` forces a platform's look.

## Grown-ups

Tap **Grown-ups** (bottom of the title screen), hold the button for 3 seconds, then answer the multiplication question (it's written in words, and a new one appears after a wrong answer). Settings:
- **Maker mode:** Little Maker (4–6) or Big Maker (7–10). Switching also applies that mode's read-aloud and playtime defaults.
- **Sound:** read-aloud on/off and volume (the top of the slider is still the gentle built-in cap; mute is always on screen).
- **Playtime reminder:** off or 10–60 minutes (default 15 for Little Maker, 20 for Big Maker). Time counts only while the app is on screen and starts over after a 30-minute break. The "Your squishies need a nap!" screen can only be dismissed through the parent gate (+10 minutes).
- **Reset all data:** erases squishies, stars and badges after a confirmation. Settings stay.

## Install and offline

It's an installable web app (Add to Home Screen on iPhone/iPad, Install on Android). After the first visit it works with no internet: `scripts/offline.js` writes a service worker at build time that precaches every file. App icons are rendered from `public/icons/icon.svg` with `node scripts/make-icons.mjs`.

## Verify a phase

```bash
npm run build
npx vite preview --port 4173 &
npm run verify       # screenshots land in verify-out/
```

`verify` renders every screen on iPhone, Pixel, iPad (landscape) and Android-tablet (landscape) profiles, at 200% text, and with reduced motion. It fails on: undersized touch targets, unnamed controls, text under 16px, horizontal scrolling, axe WCAG AA violations, page errors, or system back not returning to the title. It also walks the parent gate (short hold and a wrong answer are refused), Settings, Reset all data, the nap screen, and an offline reload.

## Where things live

- `src/data/*.js`: all game content: steps, modes, fillings (incl. play physics and sounds), add-ons, colors (100, generated from 10 families), sprays, scents, casing types, shapes (with `attach` points), accessories (keychain, bag clip…), stickers, names (presets + typed-name allow-list, also used for printed words), badges.
- `src/lib/speech.js`: read-aloud voice choice (clearest available) and `SAY_LIKE`, respellings for words speech engines mispronounce (e.g. Bead, Dough). Add options here without touching components.
- `src/components/AddonArt.jsx`: the drawing for each add-on (an add-on's `art` key in `addons.js` points here).
- `src/styles/tokens.css`: candy palette, M3 color roles, iOS roles, motion and size tokens.
- `src/components/`: platform-adaptive chrome (`AppBar`, `Buttons`, `StepTabs`) and the `Mascot`.
- `src/state/GameContext.jsx`: React context + autosave to `localStorage`, with Undo history.
- `GUIDELINES.md`: HIG/M3 checklist, signed off at the end of each phase.
- `RESEARCH.md`: Mobbin/Watermelon pattern summary.
- `ASSETS.md`: every art asset, plus the Higgsfield prompts for the generated-art pass.

## How the squish works (Step 4)

- The squishy is drawn as SVG, then snapshotted into two pictures: the filling (underneath) and the casing (on top).
- `src/lib/softbody.js` lays a 25×25 grid of springy points over those pictures. Fingers push and pull the points, and each point springs back to its rest spot. Squeezed areas shade darker, so dents read as dents.
- `src/lib/glMesh.js` draws the pictures bent along the grid with WebGL. The add-ons float between the two layers, clipped to the squishy, so they can swirl when it's shaken.
- How each texture feels and sounds (springiness, wobble, stretch, how much of a dent stays) lives in `src/data/fillings.js` under `physics` and `sounds`.
- The casing type changes the surface too (`play` in `src/data/casings.js`): Plastic shows pale stretch marks, Balloon bubbles up in a ring around a press, Gel holds dents and shapes, Wax adds a coat that cracks and chips off (`src/lib/waxChips.js`), and Bubble Wrap has bubbles that pop under a press or a rub (`src/lib/bubbleWrap.js`).
- Texture and casing decide together how moldable the squishy is (`playPhysics` in `casings.js`): the casing scales how much of the texture's moldability comes through and how fast a molded shape creeps back (`recover`). Putty in Gel stays put; Putty in a Balloon is slowly pulled back into shape by the rubber.
- Words printed on the casing (Step 2 → Words) are part of the casing picture, so they're clipped to the shape and bend with it. Each shape can set where they go with `label` in `shapes.js`.
- Without WebGL it falls back to a simple whole-squishy squash.

## Adding a sticker

1. Drop a square image with a transparent background (SVG or PNG) into `public/assets/stickers/`.
2. Add one line to `src/data/stickers.js`:
   ```js
   { id: 'my-sticker', name: 'My Sticker', image: 'my-sticker.svg', unlock: 'starter' },
   ```
   Use `unlock: { stars: 10 }` instead to show it as a locked silhouette ("Coming soon!") until 10 stars are earned. Bonus add-ons in `addons.js` use the same `unlock` field.

## Stars, badges and unlocks

- **Stars:** +1 for each new squishy saved, +3 for each badge. Stars never go down, even if a squishy is deleted.
- **Badges** (`src/data/badges.js`) reward exploring, never skill. Each has a `test` and a "Try:" hint shown until it's earned. `challenge: true` badges only appear in Big Maker.
- **Unlocks:** anything with `unlock: { stars: N }` opens when she reaches N stars, with a celebration popup.
- **Daily surprise:** `SURPRISE_ADDONS` in `addons.js`. One is picked from the date each day; add more by adding entries (and their art in `AddonArt.jsx`).

## Build phases

1. ✅ Setup, design tokens, title screen, 4-step stepper shell, research summary
2. ✅ Step 1: filling + live preview jar
3. ✅ Step 2: casing, sprays, scents, locked stickers
4. ✅ Step 3: fill interaction
5. ✅ Step 4: play physics + sounds
6. ✅ Shelf, stars, badges, unlocks, daily surprise
7. ✅ Guardrails, parent gate, PWA/offline, accessibility pass
8. ⏸ Higgsfield asset pass + polish: polish and hand-made SVG art done; Higgsfield images are blocked until the Higgsfield account has a paid plan (prompts are ready in `ASSETS.md`)
