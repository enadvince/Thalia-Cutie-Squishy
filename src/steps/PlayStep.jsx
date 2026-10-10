import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../state/GameContext'
import { fillingById } from '../data/fillings'
import { PRESET_NAMES, MAX_NAME_LENGTH, isAllowedName, tidyName, squishyName } from '../data/names'
import { SoftBody } from '../lib/softbody'
import { createRenderer } from '../lib/glMesh'
import { svgToImage } from '../lib/snapshot'
import { playNamed, jingle, sparkle } from '../lib/audio'
import { speak } from '../lib/speech'
import { tick } from '../lib/haptics'
import { bouncy } from '../lib/motion'
import SquishyView, { FILL_BOX, inflation, Accessory, Face } from '../components/SquishyView'
import OptionCard, { OptionGrid } from '../components/OptionCard'
import { ACCESSORIES } from '../data/accessories'
import { useChoose } from './useChoose'
import { addonPieces } from '../components/FillingMass'
import AddonArt, { ART_PALETTES } from '../components/AddonArt'
import { PrimaryButton } from '../components/Buttons'
import Sheet from '../components/Sheet'
import Icon from '../components/Icon'

const GRID = 24 // soft-body grid resolution
const TEXTURE_SIZE = 1024

const PlayContext = createContext(null)
const usePlay = () => useContext(PlayContext)

// Owns the soft body (shared by the canvas and the play buttons) and the filling's sounds.
export function PlayProvider({ children }) {
  const { draft } = useGame().state.maker
  const filling = fillingById(draft.fillingType)
  const bodyRef = useRef(null)
  if (bodyRef.current?.fillingId !== filling.id) {
    bodyRef.current = new SoftBody(GRID, filling.physics)
    bodyRef.current.fillingId = filling.id
  }
  const body = bodyRef.current
  const swirl = useRef(0) // how hard the add-ons are swirling (shake)
  const sound = (kind, amount) => playNamed(filling.sounds[kind], amount)

  // The play buttons act out the same gestures a finger would.
  const actions = {
    squish: () => {
      body.grab('button', 0.5, 0.55)
      sound('press', 0.3)
      tick()
      setTimeout(() => body.release('button') && sound('release'), 650)
    },
    stretch: () => {
      body.grab('button', 0.75, 0.55)
      body.move('button', 0.75 + filling.physics.stretch, 0.55)
      sound('stretch', 1)
      setTimeout(() => body.release('button') && sound('release'), 650)
    },
    poke: () => {
      body.poke(0.4 + Math.random() * 0.2, 0.45 + Math.random() * 0.2, 12)
      sound('press', 0.3)
      tick()
    },
    shake: () => {
      body.shake(1.3)
      swirl.current = 1
      sound('release')
      tick()
    },
  }

  // Shaking the phone works where the browser allows it without a permission prompt (Android).
  // iOS asks for permission, which isn't right for a kid, so iOS uses the Shake button.
  const shakeRef = useRef(actions.shake)
  shakeRef.current = actions.shake
  useEffect(() => {
    if (typeof DeviceMotionEvent === 'undefined' || typeof DeviceMotionEvent.requestPermission === 'function') return
    let last = 0
    const onMotion = (e) => {
      const a = e.acceleration
      if (!a) return
      const force = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0)
      if (force > 14 && performance.now() - last > 700) {
        last = performance.now()
        shakeRef.current()
      }
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [])

  return <PlayContext.Provider value={{ body, filling, swirl, sound, actions }}>{children}</PlayContext.Provider>
}

// Add-on pieces drift back home, and swirl around the middle while `swirl` is high.
function updateParticles(particles, swirl, dt) {
  const s = swirl.current
  for (const p of particles) {
    const tx = -(p.v + p.dv - 0.55)
    const ty = p.u + p.du - 0.5
    p.vu += (-10 * p.du - 3 * p.vu + tx * s * 6 + (Math.random() - 0.5) * s * 2) * dt
    p.vv += (-10 * p.dv - 3 * p.vv + ty * s * 6 + (Math.random() - 0.5) * s * 2) * dt
    p.du = Math.max(-0.09, Math.min(0.09, p.du + p.vu * dt))
    p.dv = Math.max(-0.09, Math.min(0.09, p.dv + p.vv * dt))
    p.rot += (p.vu - p.vv) * 8 * dt
  }
  swirl.current = s * Math.exp(-dt * 1.2)
}

function quadsFor(particles, body) {
  const groups = new Map()
  for (const p of particles) {
    const [x, y] = body.map(p.u + p.du, p.v + p.dv)
    const h = p.size / 2
    const c = Math.cos(p.rot) * h
    const s = Math.sin(p.rot) * h
    const corners = [x - c + s, y - s - c, x + c + s, y + s - c, x + c - s, y + s + c, x - c - s, y - s + c]
    if (!groups.has(p.key)) groups.set(p.key, [])
    groups.get(p.key).push({ corners, uv: [0, 0, 1, 1] })
  }
  return groups
}

// The squishy on a soft-body canvas: press, stretch, poke, pinch (two fingers), with per-filling feel.
export function PlayStage({ draft }) {
  const { body, swirl, sound, filling } = usePlay()
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const [size, setSize] = useState(0)
  const [mode, setMode] = useState('loading') // 'loading' | 'gl' | 'fallback'
  const [pressed, setPressed] = useState(false) // fallback squash
  const fingers = useRef(new Map())
  const fill = Math.max(draft.fill, 1) // Step 4 always plays with a full squishy
  const { name, savedId, ...look } = draft // renaming/saving doesn't change the picture
  const lookKey = JSON.stringify(look)

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize(Math.floor(Math.min(width, height)))
    })
    ro.observe(boxRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const renderer = createRenderer(canvas)
    if (!renderer) {
      setMode('fallback')
      return
    }
    let raf
    let alive = true
    ;(async () => {
      const [inner, casing] = await Promise.all([
        svgToImage(<SquishyView draft={look} fill={fill} still layer="inner" />, TEXTURE_SIZE),
        svgToImage(<SquishyView draft={look} fill={fill} still layer="casing" />, TEXTURE_SIZE),
      ])
      // Add-ons float as separate pieces so they can swirl when shaken.
      const { scaleX, scaleY } = inflation(fill)
      const particles = addonPieces(look.addons, FILL_BOX, FILL_BOX.y + 24).map((p) => {
        const colors = ART_PALETTES[p.art]?.length ?? 1
        const x = 130 + (p.x - 130) * scaleX
        const y = 236 + (p.y - 236) * scaleY
        return {
          key: `${p.art}-${p.index % colors}`,
          art: p.art,
          index: p.index % colors,
          u: (x + 10) / 280,
          v: (y + 20) / 280,
          du: 0,
          dv: 0,
          vu: 0,
          vv: 0,
          rot: (p.rot * Math.PI) / 180,
          size: (24 * p.scale * scaleX) / 280,
        }
      })
      const art = new Map(particles.map((p) => [p.key, p]))
      const sprites = await Promise.all(
        [...art.values()].map((p) =>
          svgToImage(
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 24 24">
              <AddonArt art={p.art} index={p.index} />
            </svg>,
            128,
          ),
        ),
      )
      if (!alive) return
      renderer.setTexture('inner', inner)
      renderer.setTexture('casing', casing)
      ;[...art.keys()].forEach((key, i) => renderer.setTexture(key, sprites[i]))
      setMode('gl')

      let last = performance.now()
      let sized = false
      const frame = (now) => {
        const dt = (now - last) / 1000
        last = now
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        const w = Math.round(canvas.clientWidth * dpr)
        const h = Math.round(canvas.clientHeight * dpr)
        if (w && h && (!sized || canvas.width !== w || canvas.height !== h)) {
          renderer.resize(w, h, Math.min(w, h))
          sized = true
        }
        body.step(dt)
        updateParticles(particles, swirl, dt)
        renderer.clear()
        renderer.drawMesh('inner', body)
        renderer.maskFrom('inner', body)
        for (const [key, quads] of quadsFor(particles, body)) renderer.drawQuads(key, quads)
        renderer.unmask()
        renderer.drawMesh('casing', body)
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    })().catch(() => alive && setMode('fallback'))
    return () => {
      alive = false
      cancelAnimationFrame(raf)
    }
    // Rebuild the textures only when the squishy's look changes (not on rename or save).
  }, [lookKey, body])

  // Finger position in squishy coordinates (0–1 across the centered square).
  const point = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const side = Math.min(r.width, r.height)
    return [0.5 + (e.clientX - r.left - r.width / 2) / side, 0.5 + (e.clientY - r.top - r.height / 2) / side]
  }
  const down = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const [x, y] = point(e)
    body.grab(e.pointerId, x, y)
    fingers.current.set(e.pointerId, { stretched: false, lastSound: 0 })
    setPressed(true)
    sound('press', 0.2)
    tick()
  }
  const move = (e) => {
    const f = fingers.current.get(e.pointerId)
    if (!f) return
    const [x, y] = point(e)
    body.move(e.pointerId, x, y)
    const g = body.grabs.get(e.pointerId)
    const now = performance.now()
    // Crunchy keeps crackling as you move; other fillings make one stretch sound.
    if (g?.moved && (!f.stretched || (filling.sounds.stretch === 'crackle' && now - f.lastSound > 160))) {
      f.stretched = true
      f.lastSound = now
      sound('stretch', Math.min(1, Math.hypot(x - g.x0, y - g.y0) * 4))
    }
  }
  const up = (e) => {
    if (!fingers.current.delete(e.pointerId)) return
    const kind = body.release(e.pointerId)
    if (fingers.current.size === 0) setPressed(false)
    sound(kind === 'poke' ? 'press' : 'release', 0.4)
  }

  return (
    <div ref={boxRef} className="relative size-full">
      {mode !== 'gl' && (
        <motion.div
          className="absolute top-1/2 left-1/2"
          animate={pressed ? { scaleX: 1.08, scaleY: 0.88 } : { scaleX: 1, scaleY: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 8 }}
          style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, originY: 0.85 }}
        >
          <SquishyView draft={draft} fill={fill} />
        </motion.div>
      )}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`${squishyName(draft)}. Press, stretch or poke it!`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className={`absolute inset-0 size-full touch-none select-none ${mode === 'gl' ? '' : 'opacity-0'}`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2"
        style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      >
        <SquishyView draft={draft} layer="scent" />
      </div>
    </div>
  )
}

const PLAY_ACTIONS = [
  { id: 'squish', label: 'Squish', icon: 'hand', color: 'bg-pink-100' },
  { id: 'stretch', label: 'Stretch', icon: 'stretch', color: 'bg-lilac-100' },
  { id: 'poke', label: 'Poke', icon: 'poke', color: 'bg-aqua-100' },
  { id: 'shake', label: 'Shake', icon: 'shake', color: 'bg-butter-100' },
]

// Play buttons, the squishy's name, Save to my Shelf and Make another.
export function PlayPanel({ onGoToStep }) {
  const { state, dispatch } = useGame()
  const { draft } = state.maker
  const { mode, readAloud, muted } = state.settings
  const { actions } = usePlay()
  const choose = useChoose()
  const [renaming, setRenaming] = useState(false)
  const name = squishyName(draft)
  const onShelf = state.shelf.find((s) => s.id === draft.savedId)
  const saved = onShelf && JSON.stringify(onShelf.draft) === JSON.stringify(draft)
  const say = (text) => readAloud && !muted && speak(text)

  const save = () => {
    dispatch({ type: 'saveSquishy' })
    jingle()
    sparkle()
    say('Saved to your shelf!')
  }

  const rename = (newName) => {
    dispatch({ type: 'updateDraft', patch: { name: newName } })
    if (draft.savedId) dispatch({ type: 'saveSquishy' })
    say(newName)
  }

  const makeAnother = () => {
    if (!saved) dispatch({ type: 'saveSquishy' }) // nothing is ever lost
    dispatch({ type: 'newSquishy' })
    onGoToStep(0)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(4.25rem,1fr))] gap-2">
        {PLAY_ACTIONS.map((a) => (
          <motion.button
            key={a.id}
            type="button"
            aria-label={a.label}
            whileTap={{ scale: 0.9 }}
            transition={bouncy}
            onClick={actions[a.id]}
            className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-[1.25rem] text-ink
              shadow-[var(--shadow-soft)] ${a.color}`}
          >
            <Icon name={a.icon} size={30} />
            <span className="text-[length:var(--text-label)] font-extrabold">{a.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <h2 className="font-display text-[length:var(--text-title)] font-semibold text-ink">{name}</h2>
        <button
          type="button"
          aria-label="Rename my squishy"
          onClick={() => setRenaming(true)}
          className="flex min-h-[56px] items-center gap-2 rounded-full bg-white px-4 text-[length:var(--text-label)] font-extrabold
            text-ink shadow-[var(--shadow-soft)]"
        >
          <Icon name="pencil" size={22} /> Rename
        </button>
      </div>

      <section aria-labelledby="make-it-a" className="flex flex-col gap-2">
        <h3 id="make-it-a" className="text-center font-display text-[length:var(--text-title)] font-semibold text-ink">
          Make it a…
        </h3>
        <OptionGrid>
          {ACCESSORIES.map((a) => (
            <OptionCard
              key={a.id}
              label={a.name}
              selected={(draft.accessory ?? 'none') === a.id}
              onClick={() => choose({ accessory: a.id }, a.name, 1.2)}
            >
              <svg viewBox="-10 -20 280 280" className="size-full" aria-hidden="true">
                <circle cx="130" cy="160" r="84" fill="#ffb3d6" />
                <ellipse cx="96" cy="118" rx="26" ry="11" fill="#fff" opacity="0.7" transform="rotate(-28 96 118)" />
                <Face face={{ x: 130, y: 168, s: 0.9 }} />
                <Accessory kind={a.id} at={[130, 76]} />
              </svg>
            </OptionCard>
          ))}
        </OptionGrid>
      </section>

      <PrimaryButton icon={saved ? 'check' : 'shelf'} onClick={save} className="w-full">
        {saved ? 'On my Shelf!' : 'Save to my Shelf'}
      </PrimaryButton>
      <button
        type="button"
        onClick={makeAnother}
        className="flex min-h-[56px] items-center justify-center gap-2 rounded-full bg-white font-display
          text-[length:var(--text-title)] font-semibold text-ink shadow-[var(--shadow-soft)]"
      >
        <Icon name="plus" size={26} /> Make another
      </button>

      {renaming && (
        <RenameSheet
          typing={mode === 'big'}
          onPick={(n) => {
            rename(n)
            history.back() // closes the sheet
          }}
          onClose={() => setRenaming(false)}
        />
      )}
    </div>
  )
}

// Little Maker picks a preset name; Big Maker can also type one (allow-listed words only).
function RenameSheet({ typing, onPick, onClose }) {
  const [text, setText] = useState('')
  const [tryAgain, setTryAgain] = useState(false)

  return (
    <Sheet title="Name your squishy!" onClose={onClose}>
      {typing && (
        <form
          className="mb-4 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (isAllowedName(text)) onPick(tidyName(text))
            else setTryAgain(true)
          }}
        >
          <label htmlFor="squishy-name" className="text-[length:var(--text-label)] font-extrabold text-ink">
            Type a name
          </label>
          <div className="flex gap-2">
            <input
              id="squishy-name"
              value={text}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              onChange={(e) => {
                setText(e.target.value.replace(/[^A-Za-z ]/g, ''))
                setTryAgain(false)
              }}
              className="min-h-[56px] min-w-0 flex-1 rounded-2xl bg-white px-4 font-label text-[length:var(--text-body)] text-ink
                ring-2 ring-ink/20 outline-none focus:ring-ink"
            />
            <button
              type="submit"
              className="min-h-[56px] shrink-0 rounded-2xl bg-pink-300 px-4 text-[length:var(--text-label)] font-extrabold text-ink"
            >
              Use it
            </button>
          </div>
          <p role="status" className="min-h-[1.5em] text-[length:var(--text-label)] text-ink-soft">
            {tryAgain ? 'Let’s try a different word! Or pick one below.' : ''}
          </p>
        </form>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2 pb-2">
        {PRESET_NAMES.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPick(n)}
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-white px-3 text-[length:var(--text-label)]
              font-extrabold text-ink shadow-[var(--shadow-soft)]"
          >
            <Icon name="sparkle" size={18} filled /> {n}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
