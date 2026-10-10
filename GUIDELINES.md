# Guidelines checklist

Sources reviewed: Apple Human Interface Guidelines (incl. *Designing for kids*, *Games*, *Accessibility*, *Typography*, *Layout*, *Motion*, *Playing haptics*) and Material Design 3 (incl. *Accessibility*, *Adaptive layout / window size classes*, *Motion: easing & duration*, *Color roles / dynamic color*, *FAB*, *Top app bar*, *Bottom sheets*, *Dialogs*). Plus App Store Kids Category (5.1.4 / 1.3) and Google Play Families Policy.

**Rule of precedence:** on iOS follow HIG and on Android follow M3. Controls and navigation follow the platform guideline. The candy look applies only to the play area and artwork.

Legend: ✅ verified · 🔜 lands in a later phase (phase number) · 🤖 checked automatically by `npm run verify`

## Every screen

| # | Check | How verified |
|---|---|---|
| T1 | Touch targets ≥ 44×44pt (iOS) / 48×48dp (Android); our default is 56px | 🤖 target-size check on every button |
| T2 | Body text ≥ 18px, labels ≥ 16px at default scale | 🤖 font-size check on all text |
| T3 | Contrast WCAG AA (4.5:1 text, 3:1 large text/UI) | 🤖 axe `wcag2aa` |
| T4 | Every control has a VoiceOver/TalkBack name | 🤖 accessible-name check + axe |
| T5 | Color is never the only signal (icon + name on every option) | Manual review: every swatch has its family icon + name; picked = ring + check badge |
| T6 | Instructions under 6 words; no reading needed to progress | `src/data/steps.js` review; icons on every step |
| T7 | Text scaling to 200% doesn't break layouts | 🤖 `*-text200` profiles: no horizontal scroll, all targets intact |
| T8 | Safe areas respected; no controls in system gesture zones | `env(safe-area-inset-*)` on bars; 24px side gutter keeps controls out of Android edge-back zones; bottom bar sits above home indicator/gesture bar |
| T9 | Reduce motion respected | `MotionConfig reducedMotion="user"` + CSS media query; 🤖 `pixel-reducedmotion` profile |
| T10 | No flashing/strobing (nothing > 3 flashes/sec) | Manual: only slow wobble (2.6s loop) |
| T11 | Undo always visible | Footer on every maker step |
| T12 | Mute toggle always visible | Title screen + every app bar |
| T13 | Portrait + landscape on tablets; portrait-first on phones | 🤖 iPad/Android-tablet landscape profiles |
| T14 | No ads, analytics, external links, or data leaving the device | No network code; `package.json` has no SDKs |

## Platform chrome

| # | iOS (HIG) | Android (M3) | Status |
|---|---|---|---|
| P1 | Nav bar: centered title, chevron + back label, translucent material | Small top app bar: leading back icon button, start-aligned title | ✅ `AppBar.jsx` |
| P2 | Back: swipe from left edge (Safari native; custom in standalone PWA) | System back / predictive back via browser history | ✅ history API + `useEdgeSwipeBack` · 🤖 back walks to title |
| P3 | Primary action: filled capsule button | Extended FAB (primary-container) | ✅ `PrimaryButton` |
| P4 | UI font: SF Pro (`-apple-system`) | UI font: Roboto | ✅ `--chrome-font` |
| P5 | Dynamic Type (`font: -apple-system-body` drives rem) | Font scale (rem follows browser text size) | ✅ |
| P6 | Motion: springs | M3 easing/duration tokens | ✅ `lib/motion.js`, `tokens.css` |
| P7 | Pickers in a sheet-style panel (1.75rem top corners, material blur) | Pickers in an M3 standard (non-modal) bottom sheet surface (28dp top corners, surface-container) | ✅ Steps 1–2; Sticker picker is a modal sheet (iOS sheet / M3 modal bottom sheet with scrim), closes on Done, scrim tap, Escape, or system back |
| P11 | Section switch: HIG segmented control (grey track, white thumb) | M3 segmented buttons (outlined, check on selected) | ✅ `SegmentedControl.jsx` |
| P8 | Alerts per HIG (centered, side-by-side buttons, bold safe choice on the left, red destructive) | M3 dialog (28dp corners, start-aligned title, text buttons at the end) | ✅ `Dialog.jsx`: delete confirm + celebrations |
| P9 | Haptics: light only (Safari has no vibrate API, so it's a no-op) | Light `vibrate(10)` tick, never continuous | ✅ step advance, fill complete, press/poke/shake (one tick each) |
| P10 | Color: candy palette mapped to M3 color roles ("dynamic color" tokens) | | ✅ `tokens.css` |

## Kids store policies

| # | Check | Status |
|---|---|---|
| K1 | Parent gate (3s hold + spelled-out 2-digit multiplication) before settings/reset/external | 🔜 7 |
| K2 | No third-party analytics/ads SDKs | ✅ |
| K3 | COPPA-safe: localStorage only, no accounts | ✅ |
| K4 | Playtime reminder | 🔜 7 |
| K5 | Text input via allow-list or presets only | ✅ Names — Little Maker: presets only; Big Maker: typed names accepted only if every word is on `ALLOWED_WORDS` (`src/data/names.js`). Printed casing words (both modes, by parent request): ready-made words, or typed words accepted only if every word is on `ALLOWED_WORDS` (max 14 letters) |

## Phase sign-off log

| Phase | Screens | Result |
|---|---|---|
| 1 | Title, Maker shell (4 steps) | ✅ `npm run verify`: 7 profiles × 5 screens with no problems. Manual screenshot review done. |
| 2 | Step 1: Type / Colors / Add-ons + live jar, Little & Big Maker | ✅ `npm run verify`: 9 profiles (adds Big Maker iPhone + iPad) with no problems; Step 1 flow checks pass (single-select type, 3-color cap, 5-add-on cap, More colors, family tabs, Undo). Manual review fixed: phone overflow, truncated segment labels, jar overflowing its card, invisible tiny add-on thumbnails. |
| 3 | Step 2: Spray / Scent / Type / Shape, sticker sheet, scent tint + particles | ✅ `npm run verify`: 9 profiles with no problems; Step 2 flow checks pass (single-select spray, locked sticker can't be picked, Done and system back close the sheet without leaving the step). Manual review of all 15 shapes. Fixed: the sheet was hidden behind the stepper (transformed ancestor broke `position: fixed`; now portaled), the puppy's ears were hidden, and the sheet title truncated at 200% text. |
| 4 | Step 3: hold FILL! or drag the piping bag, casing inflates, sparkle burst, overfill jiggle | ✅ `npm run verify`: 9 profiles with no problems; Step 3 flow checks pass (drag fills, Undo empties, ~half at 1.5s hold, full, overfull state). The FILL! button works with touch, mouse and keyboard (Space/Enter), with a progressbar for screen readers. Fixed: base CSS was unlayered, so Tailwind font/color classes on every `<button>` were ignored (now `@layer base`); filling made more visible through gel. |
| 5 | Step 4: soft-body play (press, stretch, poke, two-finger pinch, shake), per-filling physics and sounds, Save to my Shelf, Make another, Rename | ✅ `npm run verify`: 9 profiles, 119 screens, no problems. Step 4 checks pass: press and stretch, all four play buttons, Save, Rename (preset in Little Maker; allowed typed name and a gently refused word in Big Maker), and Make another (saves first, then starts fresh). Pinch is optional; every gesture also has a single-tap button. Shake uses device motion only where no permission prompt is needed (Android); iOS uses the Shake button. Physics tested in Node: Slow Rising rebounds slowly, and Putty keeps dents until shaken. |
| 6 | Title (stars, My Shelf), Shelf (squishies, badges, challenges in Big Maker), delete confirm, celebration popups, locked bonus beads, daily surprise | ✅ `npm run verify`: 9 profiles with no problems. New checks: the first save shows the First Squishy! celebration, the daily surprise unwraps, the shelf shows the saved squishy, tapping it opens it to play, the badge shows as earned, "Keep it" keeps it, "Delete" removes it and shows the empty state, and stars are unchanged after deleting. Rewards logic tested in the browser (star math, unlock thresholds, Big Maker-only challenges, stable daily pick). Unearned badges are framed as "Try:" ideas (no fail states). |
