import { useState } from 'react'
import { motion } from 'framer-motion'
import { FILLINGS } from '../data/fillings'
import { ADDONS, MAX_ADDONS, addonById, isAddonUnlocked } from '../data/addons'
import { COLOR_FAMILIES, LITTLE_SETS, MAX_FILLING_COLORS, colorById, onColor } from '../data/colors'
import { useGame } from '../state/GameContext'
import { pop, sparkle } from '../lib/audio'
import { speak } from '../lib/speech'
import { todayKey, todaysSurprise } from '../lib/rewards'
import { useChoose } from './useChoose'
import { bouncy } from '../lib/motion'
import SegmentedControl from '../components/SegmentedControl'
import OptionCard, { CheckBadge, OptionGrid as Grid } from '../components/OptionCard'
import { AddonThumb } from '../components/AddonArt'
import Icon from '../components/Icon'
import LockedCard from '../components/LockedCard'

export const FILLING_SECTIONS = [
  { id: 'type', label: 'Type', icon: 'drip', instruction: 'Pick your filling!' },
  { id: 'colors', label: 'Colors', icon: 'palette', instruction: 'Pick up to 3 colors!' },
  { id: 'addons', label: 'Add-ons', icon: 'bead', instruction: 'Add fun bits!' },
]

// Toggle an id in a list capped at `max`. Picking past the cap drops the oldest
// pick (no "full" state to fail on). Never drops below `min`.
function toggleCapped(list, id, max, min = 0) {
  if (list.includes(id)) return list.length > min ? list.filter((x) => x !== id) : list
  return [...list, id].slice(-max)
}

export default function FillingPanel({ section, onSection }) {
  const { state } = useGame()
  const { draft } = state.maker
  const { mode } = state.settings
  const choose = useChoose()

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl label="Filling parts" items={FILLING_SECTIONS} value={section} onChange={onSection} />

      {section === 'type' && (
        <Grid>
          {FILLINGS.map((f) => (
            <OptionCard
              key={f.id}
              label={f.name}
              selected={draft.fillingType === f.id}
              onClick={() => choose({ fillingType: f.id }, f.name, f.pitch)}
            >
              <Icon name={f.icon} size={52} />
            </OptionCard>
          ))}
        </Grid>
      )}

      {section === 'colors' && (
        <>
          <Tray
            label={`${draft.fillingColors.length} of ${MAX_FILLING_COLORS} colors picked`}
            max={MAX_FILLING_COLORS}
            items={draft.fillingColors.map((id) => {
              const c = colorById(id)
              return <span key={id} className="block size-full rounded-full" style={{ background: c.hex }} />
            })}
          />
          <ColorPicker
            mode={mode}
            picked={draft.fillingColors}
            onPick={(c) =>
              choose(
                { fillingColors: toggleCapped(draft.fillingColors, c.id, MAX_FILLING_COLORS, 1) },
                c.name,
                1.1,
              )
            }
          />
        </>
      )}

      {section === 'addons' && (
        <>
          <Tray
            label={`${draft.addons.length} of ${MAX_ADDONS} add-ons picked`}
            max={MAX_ADDONS}
            items={draft.addons.map((id) => (
              <AddonThumb key={id} art={addonById(id).art} />
            ))}
          />
          <Grid>
            <DailySurprise
              selected={(id) => draft.addons.includes(id)}
              onPick={(a) => choose({ addons: toggleCapped(draft.addons, a.id, MAX_ADDONS) }, a.name, 1.25)}
            />
            {ADDONS.map((a) =>
              isAddonUnlocked(a, state.stars) ? (
                <OptionCard
                  key={a.id}
                  label={a.name}
                  selected={draft.addons.includes(a.id)}
                  onClick={() => choose({ addons: toggleCapped(draft.addons, a.id, MAX_ADDONS) }, a.name, 1.25)}
                >
                  <AddonThumb art={a.art} />
                </OptionCard>
              ) : (
                <LockedCard key={a.id} name={a.name} stars={a.unlock.stars}>
                  <AddonThumb art={a.art} />
                </LockedCard>
              ),
            )}
          </Grid>
        </>
      )}
    </div>
  )
}

// Today's mystery add-on: a wrapped gift until she taps it, then a normal pick for the rest of the day.
function DailySurprise({ selected, onPick }) {
  const { state, dispatch } = useGame()
  const { readAloud, muted } = state.settings
  const day = todayKey()
  const surprise = todaysSurprise(day)

  if (state.surpriseSeen !== day) {
    return (
      <motion.button
        type="button"
        aria-label="Today's surprise! Tap to open"
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: [0, -4, 4, 0] }}
        transition={{ duration: 0.6, repeat: 2, repeatDelay: 2 }}
        onClick={() => {
          sparkle()
          if (readAloud && !muted) speak(`Surprise! ${surprise.name}!`)
          dispatch({ type: 'revealSurprise', day })
        }}
        className="flex min-h-[7.5rem] flex-col items-center justify-center gap-1 rounded-[1.5rem] bg-gradient-to-br from-pink-300
          via-lilac-300 to-aqua-300 p-2 text-center text-ink shadow-[var(--shadow-candy)]"
      >
        <Icon name="gift" size={52} />
        <span className="text-[length:var(--text-label)] leading-tight font-extrabold">Surprise!</span>
      </motion.button>
    )
  }
  return (
    <div className="relative">
      <span className="absolute -top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-butter-300 px-2 text-[length:var(--text-label)] font-extrabold text-ink">
        <Icon name="gift" size={16} /> Today
      </span>
      <OptionCard label={surprise.name} selected={selected(surprise.id)} onClick={() => onPick(surprise)}>
        <AddonThumb art={surprise.art} />
      </OptionCard>
    </div>
  )
}

// Shows picks as filled slots (e.g. ●●○ for 2 of 3), so "how many" needs no reading.
function Tray({ label, max, items }) {
  return (
    <div role="status" aria-label={label} className="flex justify-center gap-2">
      {Array.from({ length: max }, (_, i) => (
        <motion.span
          key={items[i]?.key ?? `empty-${i}`}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={bouncy}
          className={`grid size-10 place-items-center rounded-full p-1 ${
            items[i] ? 'bg-white shadow-[var(--shadow-soft)]' : 'border-2 border-dashed border-ink-soft/50'
          }`}
        >
          {items[i]}
        </motion.span>
      ))}
    </div>
  )
}

function ColorPicker({ mode, picked, onPick }) {
  const [set, setSet] = useState(0) // Little Maker: which set of 20
  const [family, setFamily] = useState('all') // Big Maker: family tab

  if (mode === 'little') {
    return (
      <div className="flex flex-col gap-4">
        {LITTLE_SETS[set].map((fam) => (
          <FamilyGrid key={fam.id} family={fam} picked={picked} onPick={onPick} />
        ))}
        <button
          type="button"
          onClick={() => {
            pop(0.9)
            setSet((s) => (s + 1) % LITTLE_SETS.length)
          }}
          className="flex min-h-16 items-center justify-center gap-3 rounded-full bg-lilac-300 px-6
            font-display text-[length:var(--text-title)] font-semibold text-ink shadow-[var(--shadow-candy)]"
        >
          <Icon name="palette" size={30} />
          More colors
          <span aria-hidden="true" className="flex gap-1">
            {LITTLE_SETS.map((_, i) => (
              <span key={i} className={`size-2.5 rounded-full ${i === set ? 'bg-ink' : 'bg-ink/25'}`} />
            ))}
          </span>
        </button>
      </div>
    )
  }

  const shown = family === 'all' ? COLOR_FAMILIES : COLOR_FAMILIES.filter((f) => f.id === family)
  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Color families" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {[{ id: 'all', name: 'All', icon: 'rainbow' }, ...COLOR_FAMILIES].map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={family === f.id}
            onClick={() => setFamily(f.id)}
            className={`flex min-h-[56px] shrink-0 items-center gap-2 rounded-full px-4 text-[length:var(--text-label)] font-extrabold
              ${family === f.id ? 'bg-pink-300 text-ink ring-2 ring-ink' : 'bg-white text-ink shadow-[var(--shadow-soft)]'}`}
          >
            <Icon name={f.icon} size={22} />
            {f.name}
          </button>
        ))}
      </div>
      {shown.map((fam) => (
        <FamilyGrid key={fam.id} family={fam} picked={picked} onPick={onPick} />
      ))}
    </div>
  )
}

function FamilyGrid({ family, picked, onPick }) {
  return (
    <section aria-label={family.name}>
      <h3 className="mb-2 flex items-center gap-2 text-[length:var(--text-label)] font-extrabold text-ink-soft">
        <Icon name={family.icon} size={22} /> {family.name}
      </h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(5.75rem,1fr))] gap-x-2 gap-y-3">
        {family.colors.map((c) => (
          <Swatch key={c.id} color={c} selected={picked.includes(c.id)} onClick={() => onPick(c)} />
        ))}
      </div>
    </section>
  )
}

// Color swatch: the color + its family icon + its name.
function Swatch({ color, selected, onClick }) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      aria-label={color.name}
      whileTap={{ scale: 0.9 }}
      transition={bouncy}
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-[1.25rem] p-1 text-center"
    >
      <span
        className={`relative grid size-14 place-items-center rounded-full shadow-[var(--shadow-candy)]
          ${selected ? 'ring-4 ring-ink ring-offset-2 ring-offset-white' : ''}`}
        style={{ background: color.hex, color: onColor(color.hex) }}
      >
        {selected && <CheckBadge />}
        <Icon name={color.icon} size={24} />
      </span>
      <span className="text-[length:var(--text-label)] leading-tight font-bold text-ink">{color.name}</span>
    </motion.button>
  )
}

