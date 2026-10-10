# Art assets

Every picture in the game is original and kid-safe: no real brands, logos or existing characters.

## What's in the app now (hand-made SVG)

| Asset | File | Notes |
|---|---|---|
| App icon | `public/icons/icon.svg` → `icon-180/192/512.png` | The mascot on a pastel background. Re-render the PNGs with `node scripts/make-icons.mjs` after changing the SVG. |
| Title backdrop | `src/components/Backdrop.jsx` | Clouds, twinkles and slow bubbles (still when reduce motion is on). |
| Stickers (16) | `public/assets/stickers/*.svg` | 9 starters, plus 7 that unlock with stars (5, 8, 12, 16, 20, 25, 30). |
| Squishies, add-ons, sprays, scents, faces | `src/components/*.jsx` | Drawn in code so they can squish, tint and swirl. |

## Higgsfield pass (blocked)

Higgsfield image generation needs a paid Higgsfield plan. The account is on the free plan (10 credits), and every image model answered "Requires basic plan or higher", so nothing was generated and no credits were spent.

When the plan allows it, generate these with `gpt_image_2_5` (medium quality, about 0.5 credits each, about 4.5 credits for all 9). Then:
- **Backgrounds:** convert to WebP and show them behind the title screen in place of `Backdrop`.
- **Icon:** save to `public/icons/` and re-render the PNG sizes.
- **Stickers:** save the transparent PNGs to `public/assets/stickers/` and add a line each to `src/data/stickers.js`. They can replace the SVG versions or be added as new unlocks.

| # | Asset | Size | Prompt |
|---|---|---|---|
| 0 | App icon | 1:1 | App icon for a children's game: one cute glossy translucent pink jelly squishy blob (dome shape, like a soft gummy dumpling) with big shiny dark eyes, tiny smile and rosy blush, glitter flecks suspended inside, soft rim light and a glossy highlight, centered with generous padding, on a soft pastel lilac-to-pink gradient background. Original kawaii character, kid-safe, no text, no letters, no logos, no brands, no existing characters. Clean, simple, readable at small sizes. |
| 1 | Title background (portrait) | 9:16 | Soft dreamy pastel background for a kids' game title screen, portrait. Candy-colored sky in pinks, lilacs, aqua and butter yellow, fluffy rounded clouds, tiny sparkles and soft bokeh bubbles, very soft and low contrast so text and buttons on top stay readable, mostly empty center. Original kawaii style, kid-safe, no characters, no text, no logos, no brands. |
| 2 | Title background (landscape) | 16:9 | Same as #1, landscape. |
| 3 | Sleepy Cloud sticker | 1:1, transparent | Single cute die-cut sticker: a sleepy little cloud with closed happy eyes, rosy cheeks and a tiny nightcap, pastel lilac and white, thick white sticker border, soft shading. Original kawaii design, kid-safe, isolated on a transparent background, no text, no logos, no brands, no existing characters. |
| 4 | Jelly Bear sticker | 1:1, transparent | Single cute die-cut sticker: a round pastel aqua jelly bear made of translucent gummy jelly with a big smile and sparkly eyes, thick white sticker border, glossy highlight. (Same safety line as #3.) |
| 5 | Cupcake Kitty sticker | 1:1, transparent | Single cute die-cut sticker: a smiling cupcake shaped like a kitty face, pink frosting with cat ears and sprinkles, pastel colors, thick white sticker border, soft shading. (Same safety line as #3.) |
| 6 | Rainbow Snail sticker | 1:1, transparent | Single cute die-cut sticker: a happy little snail whose shell is a pastel rainbow swirl, butter yellow body, big shiny eyes and blush, thick white sticker border, soft shading. (Same safety line as #3.) |
| 7 | Bubble Fish sticker | 1:1, transparent | Single cute die-cut sticker: a chubby pastel pink bubble fish blowing three shiny bubbles, big eyes and blush, thick white sticker border, glossy highlight. (Same safety line as #3.) |
| 8 | Crystal Heart sticker | 1:1, transparent | Single cute die-cut sticker: a sparkly pastel crystal heart with a sweet smiling face and tiny star twinkles around it, lilac and pink gradient, thick white sticker border. (Same safety line as #3.) |
