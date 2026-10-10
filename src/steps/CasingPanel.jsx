import { useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { SPRAYS } from '../data/sprays'
import { SCENTS } from '../data/scents'
import { CASING_TYPES } from '../data/casings'
import { SHAPES } from '../data/shapes'
import { STICKERS, FIRST_STARTER, isStickerUnlocked, stickerById, stickerSrc } from '../data/stickers'
import { useGame } from '../state/GameContext'
import { pop } from '../lib/audio'
import { speak } from '../lib/speech'
import { useChoose } from './useChoose'
import SegmentedControl from '../components/SegmentedControl'
import OptionCard, { OptionGrid } from '../components/OptionCard'
import Sheet from '../components/Sheet'
import SprayArt from '../components/SprayArt'
import ScentArt from '../components/ScentArt'
import { ShapeParts, Face, casingColor } from '../components/SquishyView'
import Icon from '../components/Icon'

export const CASING_SECTIONS = [
  { id: 'spray', label: 'Spray', icon: 'spray', instruction: 'Pick a sparkly spray!' },
  { id: 'scent', label: 'Scent', icon: 'scent', instruction: 'Pick a yummy scent!' },
  { id: 'type', label: 'Type', icon: 'balloon', instruction: 'Pick your casing!' },
  { id: 'shape', label: 'Shape', icon: 'shapes', instruction: 'Pick a cute shape!' },
]

export default function CasingPanel({ section, onSection }) {
  const { state } = useGame()
  const { draft } = state.maker
  const choose = useChoose()
  const [stickersOpen, setStickersOpen] = useState(false)
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
          {SCENTS.map((s) => (
            <OptionCard key={s.id} label={s.name} selected={draft.scent === s.id} onClick={() => choose({ scent: s.id }, s.name, 1.3)}>
              <svg viewBox="-12 -12 24 24" className="size-full" aria-hidden="true">
                <circle r="11" fill={s.tint} opacity="0.18" />
                <ScentArt particle={s.particle} />
              </svg>
            </OptionCard>
          ))}
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

      {stickersOpen && (
        <Sheet title="Pick a sticker!" onClose={() => setStickersOpen(false)}>
          <StickerGrid selected={sticker.id} onPick={(s) => choose({ spray: 'sticker', sticker: s.id }, s.name, 1.4)} />
        </Sheet>
      )}
    </div>
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
        <ellipse cx="13" cy="11" rx="6" ry="2.6" fill="#fff" opacity={type.gloss * 0.8} transform="rotate(-30 13 11)" />
      </g>
      <circle cx="20" cy="20" r="17" fill="none" stroke="#3b2a4a" strokeOpacity="0.2" strokeWidth="1" />
    </svg>
  )
}

// Sticker designs: unlocked ones can be picked; locked ones show a silhouette + lock + "Coming soon!".
function StickerGrid({ selected, onPick }) {
  return (
    <OptionGrid>
      {STICKERS.map((s) =>
        isStickerUnlocked(s) ? (
          <OptionCard key={s.id} label={s.name} selected={selected === s.id} onClick={() => onPick(s)}>
            <img src={stickerSrc(s)} alt="" className="size-16" />
          </OptionCard>
        ) : (
          <LockedSticker key={s.id} sticker={s} />
        ),
      )}
    </OptionGrid>
  )
}

function LockedSticker({ sticker }) {
  const { readAloud, muted } = useGame().state.settings
  const wiggle = useAnimationControls()
  return (
    <motion.button
      type="button"
      aria-disabled="true"
      aria-label={`${sticker.name}, locked. Coming soon!`}
      animate={wiggle}
      onClick={() => {
        pop(0.6)
        if (readAloud && !muted) speak('Coming soon!')
        wiggle.start({ rotate: [0, -6, 6, -4, 0], transition: { duration: 0.4 } })
      }}
      className="relative flex min-h-[7.5rem] flex-col items-center justify-center gap-1 rounded-[1.5rem] border-2 border-dashed
        border-ink-soft/40 bg-white/60 p-2 text-center"
    >
      <span className="absolute -top-1.5 -right-1.5 grid size-8 place-items-center rounded-full bg-lilac-300 text-ink shadow">
        <Icon name="lock" size={18} />
      </span>
      <img src={stickerSrc(sticker)} alt="" className="size-16 opacity-25 brightness-0" />
      <span className="text-[length:var(--text-label)] leading-tight font-extrabold text-ink">Coming soon!</span>
    </motion.button>
  )
}
