// Renders public/icons/icon.svg to the PNG sizes the web app manifest and iOS need.
// Usage: node scripts/make-icons.mjs  (re-run after changing icon.svg)
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const svg = readFileSync('public/icons/icon.svg', 'utf8')
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium' })
for (const size of [180, 192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } })
  await page.setContent(`<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`)
  await page.screenshot({ path: `public/icons/icon-${size}.png` })
  await page.close()
}
await browser.close()
