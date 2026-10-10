import { useState } from 'react'
import { SPRAYS } from '../data/sprays'
import { SCENTS, SODA_FLAVORS, sodaFlavorById } from '../data/scents'
import { CASING_TYPES } from '../data/casings'
import { SHAPES } from '../data/shapes'
import { STICKERS, FIRST_STARTER, isStickerUnlocked, stickerById, stickerSrc } from '../data/stickers'
import { useGame } from '../state/GameContext'
import { useChoose } from './useChoose'
import SegmentedControl from '../components/SegmentedControl'
import OptionCard, { OptionGrid } from '../components/OptionCard'
import Sheet from '../components/Sheet'
import SprayArt from '../components/SprayArt'
import ScentArt from '../components/ScentArt'
import { ShapeParts, Face, casingColor } from '../components/SquishyView'
import LockedCard from '../components/LockedCard'
import Icon from '../components/Icon'
import { LABEL_PRESETS, MAX_LABEL_LENGTH, isAllowedLabel, tidyName } from '../data/names'

export const CASING_SECTIONS = [
  { id: 'spray', label: 'Spray', icon: 'spray', instruction: 'Pick a sparkly spray!' },
  { id: 'scent', label: 'Scent', icon: 'scent', instruction: 'Pick a yummy scent!' },
  { id: 'type', label: 'Type', icon: 'balloon', instruction: 'Pick your casing!' },
  { id: 'shape', label: 'Shape', icon: 'shapes', instruction: 'Pick a cute shape!' },
  { id: 'words', label: 'Words', icon: 'text', instruction: 'Print some words!' },
]

export default function CasingPanel({ section, onSection }) {
  const { state } = useGame()
  const { draft } = state.maker
  const choose = useChoose()
  const [stickersOpen, setStickersOpen] = useState(false)
  const [sodaOpen, setSodaOpen] = useState(false)
  const flavor = sodaFlavorById(draft.sodaFlavor)
  const color = casingColor(draft)
  const sticker = stickerById(draft.sticker) ?? FIRST_STARTER

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl label="Casing parts" items={CASING_SECTIONS} value={section} onChange={onSection} />

      {section === 'spray' && (
        <OptionGrid>
          {SPRAYS.map((s) => (
            <OptionCard
              key={s.id}
              label={s.name}
              selected={draft.spray === s.id}
              onClick={() => {
                if (s.id === 'sticker') {
                  if (draft.spray !== 'sticker') choose({ spray: 'sticker', sticker: sticker.id }, s.name)
                  setStickersOpen(true)
                } else {
                  choose({ spray: s.id }, s.name, 1.2)
                }
              }}
            >
              {s.id === 'sticker' ? (
                <img src={stickerSrc(sticker)} alt="" className="size-14" />
              ) : (
                <svg viewBox="-12 -12 24 24" className="size-full overflow-visible" aria-hidden="true">
                  {[[-5, -4], [5, -5], [-4, 5], [5, 5], [0, 0]].map(([x, y], i) => (
                    <g key={i} transform={`translate(${x} ${y}) scale(0.9)`}>
                      <g stroke="#3b2a4a" strokeOpacity="0.2" strokeWidth="0.4">
                        <SprayArt art={s.art} index={i} />
                      </g>
                    </g>
                  ))}
                </svg>
              )}
            </OptionCard>
          ))}
        </OptionGrid>
      )}

      {section === 'scent' && (
        <OptionGrid>
          {SCENTS.map((s) =>
            s.flavors ? (
              // Soda: opens the flavor sheet (like Sticker Spray).
              <OptionCard
                key={s.id}
                label={draft.scent === 'soda' ? flavor.name : s.name}
                selected={draft.scent === s.id}
                onClick={() => {
                  if (draft.scent !== 'soda') choose({ scent: 'soda', sodaFlavor: flavor.id }, flavor.name, 1.3)
                  setSodaOpen(true)
                }}
              >
                <ScentThumb particle="fizz" tint={flavor.tint} color={flavor.tint} />
              </OptionCard>
            ) : (
              <OptionCard key={s.id} label={s.name} selected={draft.scent === s.id} onClick={() => choose({ scent: s.id }, s.name, 1.3)}>
                <ScentThumb particle={s.particle} tint={s.tint} />
              </OptionCard>
            ),
          )}
        </OptionGrid>
      )}

      {section === 'type' && (
        <OptionGrid>
          {CASING_TYPES.map((t) => (
            <OptionCard key={t.id} label={t.name} selected={draft.casingType === t.id} onClick={() => choose({ casingType: t.id }, t.name, 0.9)}>
              <TypeThumb type={t} color={color} />
            </OptionCard>
          ))}
        </OptionGrid>
      )}

      {section === 'shape' && (
        <OptionGrid>
          {SHAPES.map((s) => (
            <OptionCard key={s.id} label={s.name} selected={draft.shape === s.id} onClick={() => choose({ shape: s.id }, s.name, 0.8)}>
              <svg viewBox="-10 -20 280 280" className="size-full" aria-hidden="true">
                <ShapeParts parts={s.parts} fill={color} stroke="#3b2a4a" strokeOpacity="0.15" strokeWidth="6" />
                <ShapeParts parts={s.parts} fill={color} />
                {s.face && <Face face={s.face} />}
              </svg>
            </OptionCard>
          ))}
        </OptionGrid>
      )}

      {section === 'words' && (
        <WordsPicker
          label={draft.label}
          onPick={(text) => choose({ label: text }, text, 1.2)}
          onClear={() => choose({ label: null }, null, 0.8)}
        />
      )}

      {sodaOpen && (
        <Sheet title="Pick a soda flavor!" onClose={() => setSodaOpen(false)}>
          <OptionGrid>
            {SODA_FLAVORS.map((f) => (
              <OptionCard
                key={f.id}
                label={f.name}
                selected={draft.scent === 'soda' && flavor.id === f.id}
                onClick={() => choose({ scent: 'soda', sodaFlavor: f.id }, f.name, 1.3)}
              >
                <ScentThumb particle="fizz" tint={f.tint} color={f.tint} />
              </OptionCard>
            ))}
          </OptionGrid>
        </Sheet>
      )}

      {stickersOpen && (
        <Sheet title="Pick a sticker!" onClose={() => setStickersOpen(false)}>
          <StickerGrid selected={sticker.id} onPick={(s) => choose({ spray: 'sticker', sticker: s.id }, s.name, 1.4)} />
        </Sheet>
      )}
    </div>
  )
}

function ScentThumb({ particle, tint, color }) {
  return (
    <svg viewBox="-12 -12 24 24" className="size-full" aria-hidden="true">
      <circle r="11" fill={tint} opacity="0.18" />
      <ScentArt particle={particle} color={color} />
    </svg>
  )
}

// Shows how see-through each casing type is: a candy-striped backing seen through the casing.
function TypeThumb({ type, color }) {
  return (
    <svg viewBox="0 0 40 40" className="size-full" aria-hidden="true">
      <defs>
        <clipPath id={`type-${type.id}`}>
          <circle cx="20" cy="20" r="17" />
        </clipPath>
      </defs>
      <g clipPath={`url(#type-${type.id})`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={i * 7} y="0" width="3.5" height="40" fill={['#a98bff', '#4fd1c5', '#ff7eb6'][i % 3]} />
        ))}
        <rect width="40" height="40" fill={color} opacity={type.opacity} />
        {type.wax && <rect width="40" height="40" fill="#fff7ea" opacity="0.8" />}
        {type.bubbles &&
          [[8, 8], [20, 8], [32, 8], [14, 19], [26, 19], [8, 30], [20, 30], [32, 30]].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4.6" fill="#fff" opacity="0.45" stroke="#fff" strokeWidth="0.6" />
              <circle cx={x - 1.4} cy={y - 1.4} r="1.1" fill="#fff" />
            </g>
          ))}
        <ellipse cx="13" cy="11" rx="6" ry="2.6" fill="#fff" opacity={type.gloss * 0.8} transform="rotate(-30 13 11)" />
      </g>
      <circle cx="20" cy="20" r="17" fill="none" stroke="#3b2a4a" strokeOpacity="0.2" strokeWidth="1" />
    </svg>
  )
}

// Sticker designs: unlocked ones can be picked; locked ones show a silhouette, a lock and "Coming soon!".
function StickerGrid({ selected, onPick }) {
  const { stars } = useGame().state
  return (
    <OptionGrid>
      {STICKERS.map((s) =>
        isStickerUnlocked(s, stars) ? (
          <OptionCard key={s.id} label={s.name} selected={selected === s.id} onClick={() => onPick(s)}>
            <img src={stickerSrc(s)} alt="" className="size-16" />
          </OptionCard>
        ) : (
          <LockedCard key={s.id} name={s.name} stars={s.unlock.stars} />
        ),
      )}
    </OptionGrid>
  )
}

// Words printed on the casing: type them (checked against the allow-list) or tap a ready-made one.
function WordsPicker({ label, onPick, onClear }) {
  const [text, setText] = useState('')
  const [tryAgain, setTryAgain] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (isAllowedLabel(text)) {
            onPick(tidyName(text))
            setText('')
          } else setTryAgain(true)
        }}
      >
        <label htmlFor="casing-words" className="text-[length:var(--text-label)] font-extrabold text-ink">
          Type your words
        </label>
        <div className="flex gap-2">
          <input
            id="casing-words"
            value={text}
            maxLength={MAX_LABEL_LENGTH}
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
            Print it
          </button>
        </div>
        <p role="status" className="min-h-[1.5em] text-[length:var(--text-label)] text-ink-soft">
          {tryAgain ? 'Let’s try a different word! Or pick one below.' : ''}
        </p>
      </form>
      {label && (
        <button
          type="button"
          onClick={onClear}
          aria-label={`Take off the words ${label}`}
          className="flex min-h-[56px] items-center justify-center gap-2 self-start rounded-full bg-white px-5 text-[length:var(--text-label)]
            font-extrabold text-ink shadow-[var(--shadow-soft)]"
        >
          <Icon name="trash" size={20} /> No words
        </button>
      )}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2 pb-2">
        {LABEL_PRESETS.map((w) => (
          <button
            key={w}
            type="button"
            aria-pressed={label === w}
            onClick={() => onPick(w)}
            className={`flex min-h-[56px] items-center justify-center gap-2 rounded-2xl px-3 text-[length:var(--text-label)] font-extrabold
              text-ink shadow-[var(--shadow-soft)] ${label === w ? 'bg-pink-300 ring-[3px] ring-ink' : 'bg-white'}`}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  )
}
