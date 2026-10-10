import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../state/GameContext'
import { BADGES } from '../data/badges'
import { bouncy } from '../lib/motion'
import { pop } from '../lib/audio'
import AppBar from '../components/AppBar'
import SegmentedControl from '../components/SegmentedControl'
import SquishyView from '../components/SquishyView'
import Dialog from '../components/Dialog'
import { IconButton, PrimaryButton } from '../components/Buttons'
import { BadgeMedal } from '../components/Celebration'
import Icon from '../components/Icon'

const TABS = [
  { id: 'squishies', label: 'Squishies', icon: 'heart' },
  { id: 'badges', label: 'Badges', icon: 'medal' },
]

// My Squishy Shelf: saved squishies (tap to play again) and badges.
export default function ShelfScreen({ onBack, onPlay, onMake }) {
  const { state, dispatch } = useGame()
  const [tab, setTab] = useState('squishies')
  const [toDelete, setToDelete] = useState(null)
  const big = state.settings.mode === 'big'

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar title="My Shelf" onBack={onBack} backLabel="Home" />
      <main className="flex flex-1 flex-col gap-4 px-[max(var(--gutter),env(safe-area-inset-left))] pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-wrap justify-center gap-3">
          <Chip icon="star" label={`${state.stars} stars`} />
          <Chip icon="medal" label={`${state.badges.length} badges`} />
        </div>
        <SegmentedControl label="Shelf" items={TABS} value={tab} onChange={setTab} />

        {tab === 'squishies' &&
          (state.shelf.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
              <Icon name="shelf" size={72} className="text-ink-soft" />
              <p className="font-display text-[length:var(--text-title)] font-semibold">Make your first squishy!</p>
              <PrimaryButton icon="play" onClick={onMake}>
                Let’s make!
              </PrimaryButton>
            </div>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
              {[...state.shelf].reverse().map((s) => (
                <li key={s.id} className="relative">
                  <motion.button
                    type="button"
                    aria-label={`Play with ${s.name}`}
                    whileTap={{ scale: 0.95 }}
                    transition={bouncy}
                    onClick={() => {
                      pop()
                      onPlay(s.id)
                    }}
                    className="flex w-full flex-col items-center gap-1 rounded-[1.5rem] bg-white p-3 text-center shadow-[var(--shadow-soft)]"
                  >
                    <span className="block aspect-square w-full">
                      <SquishyView draft={s.draft} fill={Math.max(s.draft.fill, 1)} still />
                    </span>
                    <span className="text-[length:var(--text-label)] leading-tight font-extrabold text-ink">{s.name}</span>
                  </motion.button>
                  <IconButton
                    icon="trash"
                    label={`Delete ${s.name}`}
                    onClick={() => setToDelete(s)}
                    className="absolute -top-2 -right-2"
                  />
                </li>
              ))}
            </ul>
          ))}

        {tab === 'badges' && (
          <>
            <BadgeGrid badges={BADGES.filter((b) => !b.challenge)} earned={state.badges} />
            {big && (
              <>
                <h2 className="mt-2 flex items-center gap-2 font-display text-[length:var(--text-title)] font-semibold">
                  <Icon name="sparkle" size={24} filled /> Challenges
                </h2>
                <BadgeGrid badges={BADGES.filter((b) => b.challenge)} earned={state.badges} />
              </>
            )}
          </>
        )}
      </main>

      {toDelete && (
        <Dialog
          title={`Delete ${toDelete.name}?`}
          message="It will leave your shelf. Your stars and badges stay."
          onDismiss={() => setToDelete(null)}
          actions={[
            { label: 'Keep it', primary: true, onClick: () => setToDelete(null) },
            {
              label: 'Delete',
              destructive: true,
              onClick: () => {
                dispatch({ type: 'deleteSquishy', id: toDelete.id })
                setToDelete(null)
              },
            },
          ]}
        />
      )}
    </div>
  )
}

function Chip({ icon, label }) {
  return (
    <span className="flex min-h-12 items-center gap-2 rounded-full bg-white px-4 text-[length:var(--text-label)] font-extrabold text-ink shadow-[var(--shadow-soft)]">
      <Icon name={icon} size={22} filled={icon === 'star'} className={icon === 'star' ? 'text-[#8a6d00]' : ''} />
      {label}
    </span>
  )
}

// Earned badges are bright; the rest are "Try this!" ideas (never shown as failures).
function BadgeGrid({ badges, earned }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
      {badges.map((b) => {
        const got = earned.includes(b.id)
        return (
          <li
            key={b.id}
            className="flex flex-col items-center gap-2 rounded-[1.5rem] bg-white/80 p-3 text-center shadow-[var(--shadow-soft)]"
            aria-label={got ? `${b.name}, earned` : `${b.name}. Try this: ${b.hint}`}
          >
            <BadgeMedal icon={b.icon} earned={got} size="size-20" />
            <span className="text-[length:var(--text-label)] leading-tight font-extrabold text-ink">{b.name}</span>
            {!got && <span className="text-[length:var(--text-label)] leading-tight text-ink-soft">Try: {b.hint}</span>}
          </li>
        )
      })}
    </ul>
  )
}
