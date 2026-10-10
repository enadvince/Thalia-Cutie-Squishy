import { useId, useState } from 'react'
import { useGame, playtimeLimit } from '../state/GameContext'
import { MODES } from '../data/modes'
import { pop } from '../lib/audio'
import AppBar from '../components/AppBar'
import Dialog from '../components/Dialog'
import Icon from '../components/Icon'

const PLAYTIME_CHOICES = [0, 10, 15, 20, 30, 45, 60]

// Grown-up settings (only reachable through the parent gate). Everything here stays on this device.
export default function SettingsScreen({ onBack }) {
  const { state, dispatch } = useGame()
  const { settings } = state
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const set = (key, value) => dispatch({ type: 'setSetting', key, value })
  const limit = playtimeLimit(settings)
  const modeDefault = MODES[settings.mode].playtimeMinutes

  return (
    <div className="flex min-h-dvh flex-col">
      <AppBar title="Grown-ups" onBack={onBack} backLabel="Home" />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-[max(var(--gutter),env(safe-area-inset-left))] pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Card title="Maker mode">
          <div role="radiogroup" aria-label="Maker mode" className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-2">
            {Object.values(MODES).map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={settings.mode === m.id}
                onClick={() => {
                  pop(1.1)
                  dispatch({ type: 'setMode', mode: m.id })
                }}
                className={`flex min-h-[72px] flex-col items-start justify-center rounded-2xl px-4 py-2 text-left ${
                  settings.mode === m.id ? 'bg-pink-300 ring-[3px] ring-ink' : 'bg-white shadow-[var(--shadow-soft)]'
                }`}
              >
                <span className="text-[length:var(--text-body)] font-bold">{m.name}</span>
                <span className="text-[length:var(--text-label)] text-ink-soft">Ages {m.ages}</span>
              </button>
            ))}
          </div>
          <p className="text-[length:var(--text-label)] text-ink-soft">
            {settings.mode === 'little'
              ? 'Big icons, read-aloud, 20 colors at a time, ready-made names.'
              : 'Full labels, all 100 colors, typed names, bonus challenges.'}
          </p>
        </Card>

        <Card title="Sound">
          <Switch label="Read choices aloud" checked={settings.readAloud} onChange={(v) => set('readAloud', v)} />
          <Slider
            label="Volume"
            value={settings.volume}
            onChange={(v) => {
              set('volume', v)
              pop(1.2)
            }}
          />
          <p className="text-[length:var(--text-label)] text-ink-soft">The loudest setting is still kept gentle. The mute button is always on screen.</p>
        </Card>

        <Card title="Playtime reminder">
          <p className="text-[length:var(--text-label)] text-ink-soft">
            After this long, a friendly “Your squishies need a nap!” screen appears. Only a grown-up can add more time.
          </p>
          <div role="radiogroup" aria-label="Playtime reminder" className="flex flex-wrap gap-2">
            {PLAYTIME_CHOICES.map((min) => (
              <button
                key={min}
                type="button"
                role="radio"
                aria-checked={limit === min}
                aria-label={min ? `${min} minutes${min === modeDefault ? ' (default)' : ''}` : 'Off'}
                onClick={() => {
                  pop(1.1)
                  set('playtimeMinutes', min === modeDefault ? null : min)
                }}
                className={`min-h-[56px] min-w-[56px] rounded-full px-4 text-[length:var(--text-label)] font-bold ${
                  limit === min ? 'bg-pink-300 ring-[3px] ring-ink' : 'bg-white shadow-[var(--shadow-soft)]'
                }`}
              >
                {min ? `${min} min` : 'Off'}
              </button>
            ))}
          </div>
        </Card>

        <Card title="Saved stuff">
          <p className="text-[length:var(--text-label)] text-ink-soft">
            Squishies, stars and badges are saved only on this device. No accounts, no ads, nothing is sent anywhere.
          </p>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex min-h-[56px] items-center gap-2 self-start rounded-full bg-white px-5 text-[length:var(--text-label)] font-bold text-[#b3261e] shadow-[var(--shadow-soft)]"
          >
            <Icon name="trash" size={22} /> Reset all data
          </button>
          <p role="status" className="text-[length:var(--text-label)] text-ink-soft">
            {resetDone ? 'All squishies, stars and badges were erased.' : ''}
          </p>
        </Card>
      </main>

      {confirmReset && (
        <Dialog
          title="Erase everything?"
          message="All squishies, stars and badges will be erased. This can’t be undone. Settings stay the same."
          onDismiss={() => setConfirmReset(false)}
          actions={[
            { label: 'Keep everything', primary: true, onClick: () => setConfirmReset(false) },
            {
              label: 'Erase',
              destructive: true,
              onClick: () => {
                dispatch({ type: 'resetAll' })
                setConfirmReset(false)
                setResetDone(true)
              },
            },
          ]}
        />
      )}
    </div>
  )
}

function Card({ title, children }) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-white/70 p-4 shadow-[var(--shadow-soft)]">
      <h2 id={id} className="font-display text-[length:var(--text-title)] font-semibold text-ink">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Switch({ label, checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        pop(checked ? 0.8 : 1.2)
        onChange(!checked)
      }}
      className="flex min-h-[56px] items-center justify-between gap-3 text-left text-[length:var(--text-body)] font-semibold text-ink"
    >
      {label}
      <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#2f7d4f]' : 'bg-ink/25'}`}>
        <span className={`absolute top-1 size-6 rounded-full bg-white shadow transition-[left] ${checked ? 'left-7' : 'left-1'}`} />
      </span>
    </button>
  )
}

function Slider({ label, value, onChange }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[length:var(--text-body)] font-semibold text-ink">
        {label}: {Math.round(value * 100)}%
      </label>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        step="10"
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-14 w-full accent-[var(--focus-ring)]"
      />
    </div>
  )
}
