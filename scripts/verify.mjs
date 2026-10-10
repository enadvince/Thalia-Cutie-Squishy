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
  { name: 'iphone-bigmaker', platform: 'ios', device: devices['iPhone 13'], mode: 'big' },
  { name: 'ipad-bigmaker', platform: 'ios', device: devices['iPad Pro 11 landscape'], mode: 'big' },
]

// ONLY=iphone-portrait npm run verify  → run just the named profile(s)
const ONLY = process.env.ONLY?.split(',')

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

for (const profile of PROFILES.filter((p) => !ONLY || ONLY.includes(p.name))) {
  const context = await browser.newContext({ ...profile.device, reducedMotion: profile.reducedMotion ?? 'no-preference' })
  const page = await context.newPage()
  page.on('pageerror', (e) => problems.push(`[${profile.name}] page error: ${e.message}`))
  await page.goto(`${BASE}/?platform=${profile.platform}`)
  // Start fresh; Big Maker profiles start with the mode a grown-up would pick in Settings.
  await page.evaluate((mode) => {
    localStorage.clear()
    if (mode) localStorage.setItem('thalia-squishies:v1', JSON.stringify({ settings: { mode, readAloud: false } }))
  }, profile.mode)
  await page.reload()
  if (profile.textScale) {
    // Simulates Dynamic Type / Android font scale at 200%.
    await page.addStyleTag({ content: `html { font-size: ${profile.textScale * 100}% !important; }` })
  }

  await check(page, profile, '0-title')
  await page.getByRole('button', { name: /make/i }).click()
  await stepOne(page, profile)
  for (let i = 1; i <= 4; i++) {
    if (i === 2) await stepTwo(page, profile)
    else if (i === 3) await stepThree(page, profile)
    else if (i === 4) await stepFour(page, profile)
    if (i < 4) await page.getByRole('button', { name: /^next/i }).click()
  }
  // System back should walk back through steps, then to the title.
  for (let i = 0; i < 4; i++) await page.goBack()
  await page.waitForTimeout(500)
  if (!(await page.getByRole('button', { name: /make/i }).isVisible())) problems.push(`[${profile.name}] back did not return to title`)
  await makeAnother(page, profile)
  await shelfFlow(page, profile)
  await surpriseFlow(page, profile)
  await napFlow(page, profile)
  await grownUpFlow(page, profile)
  if (profile.name === 'iphone-portrait') await offlineFlow(page, profile, context)
  await context.close()
}

await browser.close()

// Step 1: pick a type, colors and add-ons; check the caps and Undo behave.
async function stepOne(page, profile) {
  const fail = (msg) => problems.push(`[${profile.name} / step1] ${msg}`)
  const pressed = (scope) => scope.locator('[aria-pressed="true"]').count()
  const panel = page.getByRole('region', { name: 'Choices' })

  await check(page, profile, 'step1-type')
  await panel.getByRole('button', { name: 'Crunchy' }).click()
  if ((await pressed(panel)) !== 1) fail('filling type is not single-select')

  if ((await panel.getByRole('button').count()) < 13) fail('expected 13 textures')
  await panel.getByRole('button', { name: 'Water Beads' }).click()
  await page.getByRole('tab', { name: 'Colors' }).click()
  for (const name of ['Cotton Candy', 'Cherry Pop', 'Fairy Floss', 'Strawberry Milk']) await panel.getByRole('button', { name }).click()
  // Default Bubblegum Pop + 4 more = 5 picks, capped to 4 (oldest drops).
  if ((await pressed(panel)) !== 4) fail(`expected 4 colors picked, got ${await pressed(panel)}`)
  await check(page, profile, 'step1-colors')
  if (profile.mode === 'big') {
    await page.getByRole('tab', { name: 'Blues' }).click()
    await check(page, profile, 'step1-colors-blues')
  } else {
    await page.getByRole('button', { name: 'Next colors' }).click()
    if (!(await panel.getByRole('button', { name: 'Peach Fuzz' }).isVisible())) fail('the next-page arrow did not show the next colors')
    await page.getByRole('button', { name: 'Previous colors' }).click()
    const page5 = page.getByRole('tab', { name: /Color page 5 of 5/ })
    await page5.evaluate((el) => el.scrollIntoView({ block: 'center' })) // clear of the sticky Next bar at big text sizes
    await page5.click()
    if (!(await panel.getByRole('button', { name: 'Marshmallow' }).isVisible())) fail('the page overview did not jump to page 5')
    if ((await page.getByRole('tab', { name: /Color page 5 of 5/ }).getAttribute('aria-selected')) !== 'true') fail('page indicator not on page 5')
  }

  await page.getByRole('tab', { name: 'Add-ons' }).click()
  await panel.getByRole('button', { name: /Today's surprise/ }).click()
  if ((await panel.getByRole('button', { name: /Today's surprise/ }).count()) !== 0) fail('the daily surprise did not unwrap')
  const addons = ['Beads', 'Glitter', 'Star Beads', 'Heart Beads', 'Cloud Puppy Beads', 'Bow Kitty Beads']
  for (const name of addons) await panel.getByRole('button', { name, exact: true }).click()
  if ((await pressed(panel)) !== 5) fail(`expected 5 add-ons picked, got ${await pressed(panel)}`)
  await check(page, profile, 'step1-addons')

  await page.getByRole('button', { name: 'Undo' }).click()
  const afterUndo = await pressed(panel)
  if (afterUndo !== 5 || !(await panel.getByRole('button', { name: 'Beads', exact: true }).getAttribute('aria-pressed')).includes('true'))
    fail('Undo did not restore the previous add-ons')
}

// Step 2: sprays, the sticker sheet (locked stickers, Done, system back), scents, types, shapes.
async function stepTwo(page, profile) {
  const fail = (msg) => problems.push(`[${profile.name} / step2] ${msg}`)
  const panel = page.getByRole('region', { name: 'Choices' })
  const dialog = page.getByRole('dialog')

  await check(page, profile, 'step2-spray')
  await panel.getByRole('button', { name: 'Heart Spray' }).click()
  if ((await panel.locator('[aria-pressed="true"]').count()) !== 1) fail('spray is not single-select')

  await panel.getByRole('button', { name: 'Sticker Spray' }).click()
  await dialog.waitFor()
  const locked = dialog.getByRole('button', { name: /locked/ })
  if ((await locked.count()) !== 1) fail(`expected 1 locked sticker, got ${await locked.count()}`)
  await locked.first().dispatchEvent('click') // aria-disabled, but a tap still lands (it wiggles)
  if ((await dialog.locator('[aria-pressed="true"]').count()) !== 1) fail('tapping a locked sticker changed the pick')
  await dialog.getByRole('button', { name: 'Rainbow Cloud' }).click()
  await check(page, profile, 'step2-stickers')
  await dialog.getByRole('button', { name: 'Done' }).click()
  await dialog.waitFor({ state: 'detached' })

  // System back closes the sheet but stays on Step 2.
  await panel.getByRole('button', { name: 'Sticker Spray' }).click()
  await dialog.waitFor()
  await page.goBack()
  await dialog.waitFor({ state: 'detached', timeout: 3000 }).catch(() => fail('system back did not close the sticker sheet'))
  if (!(await page.getByRole('button', { name: 'Step 2: Casing' }).getAttribute('aria-current'))) fail('system back left Step 2')

  await page.getByRole('tab', { name: 'Scent' }).click()
  // Soda opens a flavor sheet; picking a flavor renames the card.
  await panel.getByRole('button', { name: /Soda/ }).click()
  await dialog.waitFor()
  if ((await dialog.getByRole('button').count()) < 8) fail('expected 7 soda flavors in the sheet')
  await dialog.getByRole('button', { name: 'Grape Soda' }).click()
  await check(page, profile, 'step2-soda')
  await dialog.getByRole('button', { name: 'Done' }).click()
  await dialog.waitFor({ state: 'detached' })
  if (!(await panel.getByRole('button', { name: 'Grape Soda' }).isVisible())) fail('the soda card did not show the picked flavor')
  await check(page, profile, 'step2-scent')
  await page.getByRole('tab', { name: 'Type' }).click()
  await panel.getByRole('button', { name: 'Plastic' }).click()
  await panel.getByRole('button', { name: 'Bubble Wrap' }).click() // popped in Step 4
  await page.getByRole('tab', { name: 'Shape' }).click()

  // One profile saves a preview of every shape for manual review.
  if (profile.name === 'ipad-landscape') {
    mkdirSync(`${OUT}/shapes`, { recursive: true })
    const names = await panel.locator('button[aria-pressed]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
    for (const name of names) {
      await panel.getByRole('button', { name, exact: true }).click()
      await page.waitForTimeout(450)
      await page.getByRole('region', { name: 'Squishy preview' }).screenshot({ path: `${OUT}/shapes/${name}.png` })
    }
  }
  await panel.getByRole('button', { name: 'Kitty' }).click()
  await check(page, profile, 'step2-shape')

  // Words printed on the casing: a ready-made one, a typed one (allow-list), and a refused one.
  const label = () => page.evaluate(() => JSON.parse(localStorage.getItem('thalia-squishies:v1')).maker.draft.label)
  await page.getByRole('tab', { name: 'Words' }).click()
  await panel.getByRole('button', { name: 'Best Friend' }).click()
  if ((await label()) !== 'Best Friend') fail('picking ready-made words did not print them')
  const input = panel.getByLabel('Type your words')
  await input.fill('happy bunny')
  await panel.getByRole('button', { name: 'Print it' }).click()
  if ((await label()) !== 'Happy Bunny') fail(`typed words were not printed (got ${await label()})`)
  await input.fill('zzzz')
  await panel.getByRole('button', { name: 'Print it' }).click()
  if ((await label()) !== 'Happy Bunny') fail('a word not on the allow-list was printed')
  if (!(await panel.getByText('Let’s try a different word!').isVisible())) fail('no gentle message for a refused word')
  if (!(await page.getByRole('img', { name: /printed with “Happy Bunny”/ }).first().isVisible())) fail('the words are not on the squishy')
  await check(page, profile, 'step2-words')
}

// Step 3: fill by dragging the piping bag and by holding FILL!; Undo; full and overfull.
async function stepThree(page, profile) {
  const fail = (msg) => problems.push(`[${profile.name} / step3] ${msg}`)
  const meter = page.getByRole('progressbar', { name: 'How full your squishy is' })
  const level = async () => Number(await meter.getAttribute('aria-valuenow'))
  const center = async (locator) => {
    await locator.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    const b = await locator.boundingBox()
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
  }
  const hold = async (ms) => {
    const c = await center(page.getByRole('button', { name: /^Fill!/ }))
    await page.mouse.move(c.x, c.y)
    await page.mouse.down()
    await page.waitForTimeout(ms)
    await page.mouse.up()
    await page.waitForTimeout(150)
  }

  await check(page, profile, 'step3-empty')
  if ((await level()) !== 0) fail('a new squishy should start empty')

  // Drag the piping bag onto the casing and hold it there.
  const bag = await center(page.getByRole('img', { name: /Piping bag/ }))
  const target = await center(page.getByRole('img', { name: /squishy with/ }))
  await page.mouse.move(bag.x, bag.y)
  await page.mouse.down()
  await page.mouse.move(target.x, target.y, { steps: 12 })
  await page.waitForTimeout(1200)
  await page.mouse.up()
  await page.waitForTimeout(300)
  if ((await level()) <= 10) fail(`dragging the bag onto the squishy did not fill it (level ${await level()})`)

  await page.getByRole('button', { name: 'Undo' }).click()
  if ((await level()) !== 0) fail(`Undo did not empty the squishy (level ${await level()})`)

  await hold(1500)
  const half = await level()
  if (half < 30 || half > 70) fail(`holding FILL! for 1.5s gave ${half}%, expected about half`)
  await check(page, profile, 'step3-half')

  await hold(3600)
  if ((await level()) !== 100) fail(`holding FILL! longer did not fill it (level ${await level()})`)
  await hold(800)
  if (!(await meter.getAttribute('aria-valuetext')).includes('extra')) fail('overfilling did not show the extra-squishy state')
  await check(page, profile, 'step3-full')
}

// Rewards can pop up after any save; tap "Yay!" until they're all seen.
async function dismissCelebrations(page) {
  const party = page.getByRole('alertdialog')
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(300)
    if (!(await party.count())) return
    await party.getByRole('button', { name: 'Yay!' }).click()
  }
}

function shelfOf(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('thalia-squishies:v1')).shelf)
}

// Step 4: soft-body press and stretch, the play buttons, Save to my Shelf, Rename.
async function stepFour(page, profile) {
  const fail = (msg) => problems.push(`[${profile.name} / step4] ${msg}`)
  const canvas = page.getByRole('img', { name: /Press, stretch or poke/ })
  await canvas.waitFor()
  await page.waitForTimeout(1500) // textures
  await check(page, profile, 'step4-play')

  await canvas.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  const b = await canvas.boundingBox()
  const side = Math.min(b.width, b.height)
  const cx = b.x + b.width / 2
  const cy = b.y + b.height / 2
  await page.mouse.move(cx, cy + side * 0.05)
  await page.mouse.down()
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${profile.name}--step4-press.png` })
  await page.mouse.up()
  await page.waitForTimeout(600)
  await page.mouse.move(cx + side * 0.3, cy)
  await page.mouse.down()
  await page.mouse.move(cx + side * 0.7, cy - 8, { steps: 8 })
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${OUT}/${profile.name}--step4-stretch.png` })
  await page.mouse.up()

  for (const name of ['Squish', 'Stretch', 'Poke', 'Shake']) await page.getByRole('button', { name, exact: true }).click()

  // Make it a keychain (and the picture updates without errors).
  await page.getByRole('button', { name: 'Keychain', exact: true }).click()
  if ((await page.getByRole('button', { name: 'Keychain', exact: true }).getAttribute('aria-pressed')) !== 'true') fail('Keychain was not picked')
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}/${profile.name}--step4-keychain.png` })

  await page.getByRole('button', { name: 'Save to my Shelf' }).click()
  if ((await shelfOf(page)).length !== 1) fail('Save to my Shelf did not save')
  // The first save earns a badge (and maybe unlocks): one celebration each.
  const party = page.getByRole('alertdialog')
  await party.waitFor({ timeout: 3000 }).catch(() => fail('no celebration for the first badge'))
  if (!(await party.textContent()).includes('First Squishy!')) fail('the first celebration was not the First Squishy! badge')
  await check(page, profile, 'step4-celebration')
  await dismissCelebrations(page)
  if (!(await page.getByRole('button', { name: 'On my Shelf!' }).isVisible())) fail('saved state not shown')

  await dismissCelebrations(page)
  await page.getByRole('button', { name: 'Rename my squishy' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  let expected = 'Mochi'
  if (profile.mode === 'big') {
    const input = dialog.getByLabel('Type a name')
    await input.fill('Zorglub')
    await dialog.getByRole('button', { name: 'Use it' }).click()
    if (!(await dialog.getByRole('status').textContent()).includes('different')) fail('a word not on the allow-list was not gently refused')
    await input.fill('rainbow mochi')
    await dialog.getByRole('button', { name: 'Use it' }).click()
    expected = 'Rainbow Mochi'
  } else {
    if (await dialog.getByLabel('Type a name').count()) fail('Little Maker should not show a keyboard')
    await dialog.getByRole('button', { name: 'Mochi', exact: true }).click()
  }
  await dialog.waitFor({ state: 'detached' })
  if (!(await page.getByRole('heading', { name: expected }).isVisible())) fail(`name did not change to ${expected}`)
  if ((await shelfOf(page))[0]?.name !== expected) fail('renaming a saved squishy did not update the Shelf')
  await dismissCelebrations(page)
  await check(page, profile, 'step4-saved')
}

// Make another: saves what's there and starts a fresh squishy at Step 1.
async function makeAnother(page, profile) {
  const fail = (msg) => problems.push(`[${profile.name} / make another] ${msg}`)
  await page.getByRole('button', { name: /make/i }).click()
  await page.getByRole('button', { name: 'Step 4: Play' }).click()
  await dismissCelebrations(page)
  await page.getByRole('button', { name: 'Make another' }).click()
  await page.waitForTimeout(400)
  if (!(await page.getByRole('button', { name: 'Step 1: Filling' }).getAttribute('aria-current'))) fail('did not go back to Step 1')
  if ((await shelfOf(page)).length !== 1) fail('the shelf should still hold exactly the one saved squishy')
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('thalia-squishies:v1')).maker.draft)
  if (draft.savedId || draft.name || draft.fill !== 0) fail('the new squishy did not start fresh')
}

// Shelf: stars on the title, play a saved squishy again, badges, delete with confirmation.
async function shelfFlow(page, profile) {
  const fail = (msg) => problems.push(`[${profile.name} / shelf] ${msg}`)
  await dismissCelebrations(page)
  const shelfButton = page.getByRole('button', { name: 'My Shelf', exact: true })
  for (let i = 0; i < 20 && !(await shelfButton.isVisible()); i++) await page.goBack()
  const stars = await page.evaluate(() => JSON.parse(localStorage.getItem('thalia-squishies:v1')).stars)
  if (stars < 4) fail(`expected at least 4 stars after the first save, got ${stars}`)
  if (!(await page.getByRole('img', { name: `${stars} stars` }).isVisible())) fail('stars not shown on the title screen')

  await shelfButton.click()
  await check(page, profile, 'shelf')
  const cards = page.getByRole('button', { name: /^Play with / })
  if ((await cards.count()) !== 1) fail(`expected 1 squishy on the shelf, got ${await cards.count()}`)

  await cards.first().click()
  await page.waitForTimeout(400)
  if (!(await page.getByRole('button', { name: 'Step 4: Play' }).getAttribute('aria-current'))) fail('tapping a shelf squishy did not open it to play')
  for (let i = 0; i < 4; i++) await page.goBack()
  await page.waitForTimeout(300)

  await page.getByRole('tab', { name: 'Badges' }).click()
  if (!(await page.getByRole('listitem', { name: 'First Squishy!, earned' }).isVisible())) fail('First Squishy! badge not shown as earned')
  await check(page, profile, 'shelf-badges')
  await page.getByRole('tab', { name: 'Squishies' }).click()

  const del = page.getByRole('button', { name: /^Delete / })
  await del.click()
  const confirm = page.getByRole('alertdialog')
  await confirm.waitFor()
  await check(page, profile, 'shelf-delete')
  await confirm.getByRole('button', { name: 'Keep it' }).click()
  if ((await cards.count()) !== 1) fail('Keep it should keep the squishy')
  await del.click()
  await confirm.getByRole('button', { name: 'Delete', exact: true }).click()
  await page.waitForTimeout(300)
  if ((await cards.count()) !== 0) fail('Delete did not remove the squishy')
  if (!(await page.getByText('Make your first squishy!').isVisible())) fail('empty shelf message missing')
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('thalia-squishies:v1')).stars)
  if (after !== stars) fail('deleting a squishy changed the stars')
}

console.log(problems.length ? `\n${problems.length} problem(s):\n${problems.join('\n')}` : '\nAll checks passed.')
process.exit(problems.length ? 1 : 0)

// Title screen "Surprise me!": a random squishy, filled and ready on the Play step.
async function surpriseFlow(page, profile) {
  const fail = (msg) => problems.push(`[${profile.name} / surprise] ${msg}`)
  const surprise = page.getByRole('button', { name: 'Surprise me!' })
  for (let i = 0; i < 20 && !(await surprise.isVisible()); i++) await page.goBack()
  await surprise.click()
  await page.waitForTimeout(500)
  await dismissCelebrations(page)
  if (!(await page.getByRole('button', { name: 'Step 4: Play' }).getAttribute('aria-current'))) fail('did not open the Play step')
  const draft = await page.evaluate(() => JSON.parse(localStorage.getItem('thalia-squishies:v1')).maker.draft)
  if (draft.fill !== 1 || !draft.name || draft.savedId) fail('the surprise squishy is not a fresh, filled squishy')
  await check(page, profile, 'surprise')
}

// Parent gate helpers: hold for 3 seconds, then read the problem in words and answer it.
function wordsToNumber(text) {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
    'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  return text.split('-').reduce((sum, w) => sum + (ones.includes(w) ? ones.indexOf(w) : tens.indexOf(w) * 10), 0)
}

async function holdGate(page, ms = 3300) {
  const hold = page.getByRole('button', { name: 'Hold for 3 seconds' })
  await hold.scrollIntoViewIfNeeded()
  const box = await hold.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(ms)
  await page.mouse.up()
}

async function passGate(page, { wrongFirst = false, fail } = {}) {
  const gate = page.getByRole('dialog', { name: 'For grown-ups' })
  await gate.waitFor()
  // Letting go early must not open it.
  const hold = page.getByRole('button', { name: 'Hold for 3 seconds' })
  await holdGate(page, 800)
  if (await gate.getByRole('textbox').count()) fail?.('a short hold opened the math question')
  await holdGate(page)
  const read = async () => {
    const q = await gate.locator('label').first().textContent()
    const [, a, b] = q.match(/What is ([a-z-]+) times ([a-z-]+)\?/)
    return { q, answer: wordsToNumber(a) * wordsToNumber(b) }
  }
  if (wrongFirst) {
    const first = await read()
    await gate.getByRole('textbox').fill(String(first.answer + 1))
    await gate.getByRole('button', { name: 'Check' }).click()
    if (!(await hold.isVisible())) fail?.('a wrong answer did not start over with the hold')
    await holdGate(page)
    if ((await read()).q === first.q) fail?.('a wrong answer did not give a new problem')
  }
  const { answer } = await read()
  await gate.getByRole('textbox').fill(String(answer))
  await gate.getByRole('button', { name: 'Check' }).click()
  await gate.waitFor({ state: 'detached' })
}

async function goTitle(page) {
  const grownUps = page.getByRole('button', { name: 'Grown-ups', exact: true })
  for (let i = 0; i < 20 && !(await grownUps.isVisible()); i++) await page.goBack()
  return grownUps
}

// Grown-ups: the parent gate in front of Settings; mode, playtime, volume, reset all data.
async function grownUpFlow(page, profile) {
  const fail = (msg) => problems.push(`[${profile.name} / grown-ups] ${msg}`)
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('thalia-squishies:v1')))
  const grownUps = await goTitle(page)
  await grownUps.click()
  await page.getByRole('dialog', { name: 'For grown-ups' }).waitFor()
  await check(page, profile, 'parent-gate')
  await page.getByRole('button', { name: 'Cancel' }).click()
  if (await page.getByRole('dialog', { name: 'For grown-ups' }).count()) fail('Cancel did not close the gate')

  await grownUps.click()
  await passGate(page, { wrongFirst: true, fail })
  const settings = page.getByRole('radiogroup', { name: 'Maker mode' })
  if (!(await settings.isVisible())) fail('passing the gate did not open Settings')
  await check(page, profile, 'settings')

  const other = profile.mode === 'big' ? 'Little Maker' : 'Big Maker'
  await settings.getByRole('radio', { name: new RegExp(other) }).click()
  if ((await saved()).settings.mode === (profile.mode ?? 'little')) fail('switching the maker mode did not stick')
  await settings.getByRole('radio', { name: new RegExp(profile.mode === 'big' ? 'Big Maker' : 'Little Maker') }).click()
  await page.getByRole('radio', { name: '30 minutes' }).click()
  if ((await saved()).settings.playtimeMinutes !== 30) fail('the playtime choice did not stick')
  await page.getByRole('slider', { name: /Volume/ }).fill('50')
  if ((await saved()).settings.volume !== 0.5) fail('the volume did not stick')

  await page.getByRole('button', { name: 'Reset all data' }).click()
  const confirm = page.getByRole('alertdialog')
  await confirm.getByRole('button', { name: 'Keep everything' }).click()
  if (!(await saved()).stars) fail('Keep everything should keep the stars')
  await page.getByRole('button', { name: 'Reset all data' }).click()
  await confirm.getByRole('button', { name: 'Erase' }).click()
  const after = await saved()
  if (after.stars || after.shelf.length || after.badges.length) fail('Reset all data did not erase squishies, stars and badges')
  if (after.settings.playtimeMinutes !== 30) fail('Reset all data should keep the settings')

  // System back leaves Settings, and going forward again must not skip the gate.
  await page.goBack()
  await page.waitForTimeout(300)
  await page.goForward()
  await page.waitForTimeout(300)
  if (await page.getByRole('radiogroup', { name: 'Maker mode' }).isVisible()) fail('history forward reopened Settings without the gate')
}

// Playtime reminder: nap screen when the time is up; only a grown-up can add more time.
async function napFlow(page, profile) {
  const fail = (msg) => problems.push(`[${profile.name} / nap] ${msg}`)
  await goTitle(page)
  const limit = profile.mode === 'big' ? 20 : 15
  // Set before the app starts (the running app saves its own count as the page unloads).
  await page.addInitScript((ms) => {
    if (sessionStorage.getItem('nap-test')) return
    sessionStorage.setItem('nap-test', '1')
    localStorage.setItem('thalia-squishies:playtime', JSON.stringify({ used: ms, last: Date.now() }))
  }, limit * 60000 - 1000)
  await page.reload()
  const nap = page.getByRole('dialog', { name: 'Your squishies need a nap!' })
  try {
    await nap.waitFor({ timeout: 12000 })
  } catch {
    fail(`no nap screen after the ${limit}-minute default`)
    return
  }
  await check(page, profile, 'nap')
  await page.getByRole('button', { name: 'Grown-ups: more time' }).click()
  await passGate(page, { fail })
  if (await nap.count()) fail('the grown-up did not get more time')
}

// Offline: once the service worker is ready, the app reloads and plays with no network.
async function offlineFlow(page, profile, context) {
  const fail = (msg) => problems.push(`[${profile.name} / offline] ${msg}`)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload() // let the worker control the page
  await context.setOffline(true)
  await page.reload()
  if (!(await page.getByRole('button', { name: /make/i }).isVisible())) fail('the title screen did not load offline')
  await page.getByRole('button', { name: /make/i }).click()
  if (!(await page.getByRole('region', { name: 'Choices' }).isVisible())) fail('the maker did not load offline')
  await check(page, profile, 'offline')
  await context.setOffline(false)
}
