# Design research summary (Phase 1)

## Mobbin
**Not available:** the Mobbin MCP returned "requires a paid plan" for both screen and flow searches. The patterns below come from well-known kids' creative and character-builder apps (avatar creators, Toca Boca-style maker games, dress-up/cake-maker apps, sticker-book collections) instead of fresh Mobbin screenshots. If you upgrade Mobbin, I can redo this with cited screens.

## Patterns we're borrowing

1. **Preview-in-center, picker-below (or beside on tablets).** The creation is always the biggest thing on screen and reacts live to every choice. Choices sit in a bottom tray on phones and a side panel on landscape tablets. *Used:* the stage + panel grid in `MakerScreen` (panel appears at `md:landscape`).
2. **Icon stepper with a "you are here" blob.** A short row of 3–5 big icon steps, with a soft colored shape sliding behind the current one. No numbers or progress percentage are needed to understand it. *Used:* `StepTabs`.
3. **Big swatch grids grouped by family tabs.** Round swatches about 56–64px, with a family tab row above. Selection shows as a ring plus a check icon, never color alone. *Used in Phase 2.*
4. **One big forward button in the thumb zone, with undo always visible beside it.** *Used:* footer with Undo (left) and Next (right).
5. **Collection shelf with locked silhouettes.** Locked items show a grey silhouette with a lock and a friendly "Coming soon!", which gives kids a reason to come back. *Used in Phases 3 and 6.*

## Watermelon UI
- `get_inspiration("playful bouncy buttons, stepper and tabs…")` returned: stepper, **Continuous Tabs**, Discrete Tabs, Fluid Tabs, Pop Stepper, and Tabs 1.
- `search("stepper progress steps")` returned: Labeled Progress Indicator, Pop Stepper, Progressive Input Stack, and others.
- **Adopted:** *Continuous Tabs* (sliding `layoutId` pill with spring 380/30/0.9), converted from TSX to JSX, moved from `motion/react` to `framer-motion`, and re-skinned in candy pink. Now `src/components/StepTabs.jsx`, and it will be reused for color-family tabs.
- **Considered for later:** *Pop Stepper* (playful +/− micro-interaction) for bead counts or the fill amount; *Labeled Progress Indicator* for the Step 3 fill meter (we'll drop its infinite shimmer to stay calm and non-flashing).
- The button catalog entries (Button 1–18) are plain shadcn buttons. Our `PrimaryButton` follows each platform's guideline (iOS capsule / M3 extended FAB) with a Framer `whileTap` bounce instead.
