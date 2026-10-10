// Phase verification: renders every screen on iOS/Android phone + tablet profiles,
// at normal and 200% text, and checks the GUIDELINES.md items that a script can check.
// Usage: npm run build && npx vite preview --port 4173 & npm run verify
import { chromium, devices } from 'playwright'
import { AxeBuilder } from '@axe-core/playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const OUT = 'verify-out'
mkdirSync(OUT, { recursive: true })

const PROFILES = [
  { name: 'iphone-portrait', platform: 'ios', device: devices['iPhone 13'] },
  { name: 'pixel-portrait', platform: 'android', device: devices['Pixel 7'] },
  { name: 'ipad-landscape', platform: 'ios', device: devices['iPad Pro 11 landscape'] },
  { name: 'androidtab-landscape', platform: 'android', device: { ...devices['Galaxy Tab S4 landscape'] } },
  { name: 'iphone-text200', platform: 'ios', device: devices['iPhone 13'], textScale: 2 },
  { name: 'pixel-text200', platform: 'android', device: devices['Pixel 7'], textScale: 2 },
  { name: 'pixel-reducedmotion', platform: 'android', device: devices['Pixel 7'], reducedMotion: 'reduce' },
]

const MIN_TARGET = { ios: 44, android: 48 }
const problems = []
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

async function check(page, profile, label) {
  const file = `${OUT}/${profile.name}--${label}.png`
  await page.waitForTimeout(700)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: file, fullPage: true })

  const result = await page.evaluate((min) => {
    const issues = []
    if (document.documentElement.scrollWidth > window.innerWidth + 1) issues.push('horizontal page scroll')
    for (const el of document.querySelectorAll('button, a, [role="button"]')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0) continue // hidden
      const name = el.getAttribute('aria-label') || el.textContent.trim()
      if (!name) issues.push(`control with no accessible name: ${el.outerHTML.slice(0, 80)}`)
      if (r.width < min || r.height < min) issues.push(`small target ${Math.round(r.width)}x${Math.round(r.height)}: "${name}"`)
    }
    for (const el of document.querySelectorAll('p, h1, span')) {
      if (!el.textContent.trim() || el.closest('[aria-hidden]')) continue
      const px = parseFloat(getComputedStyle(el).fontSize)
      if (px < 16) issues.push(`text under 16px (${px}px): "${el.textContent.trim().slice(0, 30)}"`)
    }
    return issues
  }, MIN_TARGET[profile.platform])

  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
  for (const v of axe.violations) result.push(`axe ${v.id}: ${v.nodes.length} node(s) – ${v.help}`)

  for (const issue of result) problems.push(`[${profile.name} / ${label}] ${issue}`)
  console.log(`${result.length ? '✗' : '✓'} ${profile.name} / ${label}`)
}

for (const profile of PROFILES) {
  const context = await browser.newContext({ ...profile.device, reducedMotion: profile.reducedMotion ?? 'no-preference' })
  const page = await context.newPage()
  page.on('pageerror', (e) => problems.push(`[${profile.name}] page error: ${e.message}`))
  await page.goto(`${BASE}/?platform=${profile.platform}`)
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  if (profile.textScale) {
    // Simulates Dynamic Type / Android font scale at 200%.
    await page.addStyleTag({ content: `html { font-size: ${profile.textScale * 100}% !important; }` })
  }

  await check(page, profile, '0-title')
  await page.getByRole('button', { name: /make/i }).click()
  for (let i = 1; i <= 4; i++) {
    await check(page, profile, `step${i}`)
    if (i < 4) await page.getByRole('button', { name: /^next/i }).click()
  }
  // System back should walk back through steps, then to the title.
  for (let i = 0; i < 4; i++) await page.goBack()
  await page.waitForTimeout(500)
  if (!(await page.getByRole('button', { name: /make/i }).isVisible())) problems.push(`[${profile.name}] back did not return to title`)
  await context.close()
}

await browser.close()
console.log(problems.length ? `\n${problems.length} problem(s):\n${problems.join('\n')}` : '\nAll checks passed.')
process.exit(problems.length ? 1 : 0)
