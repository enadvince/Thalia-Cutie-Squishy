import { useEffect } from 'react'
import { useGame } from '../state/GameContext'
import { badgeById } from '../data/badges'
import { stickerById, stickerSrc } from '../data/stickers'
import { addonById } from '../data/addons'
import { jingle } from '../lib/audio'
import { speak } from '../lib/speech'
import Dialog from './Dialog'
import Confetti from './Confetti'
import Icon from './Icon'
import { AddonThumb } from './AddonArt'

const TITLES = { badge: 'You earned a badge!', sticker: 'New sticker unlocked!', addon: 'New beads unlocked!' }

// Shows queued rewards one at a time (badges, star unlocks), with confetti and a jingle.
export default function Celebration() {
  const { state, dispatch } = useGame()
  const news = state.news[0]
  const { readAloud, muted } = state.settings

  const item = !news
    ? null
    : news.kind === 'badge'
      ? { name: badgeById(news.id)?.name, art: <BadgeMedal icon={badgeById(news.id)?.icon} earned /> }
      : news.kind === 'sticker'
        ? { name: stickerById(news.id)?.name, art: <img src={stickerSrc(stickerById(news.id))} alt="" className="size-24" /> }
        : { name: addonById(news.id)?.name, art: <span className="block size-24"><AddonThumb art={addonById(news.id)?.art} /></span> }

  const key = news ? `${news.kind}-${news.id}` : null
  useEffect(() => {
    if (!key) return
    jingle()
    if (readAloud && !muted) speak(`${TITLES[news.kind]} ${item.name}!`)
    // Once per celebration (not on every re-render).
  }, [key])

  if (!news || !item.name) return null
  return (
    <>
      <Confetti key={key} />
      <Dialog
        title={TITLES[news.kind]}
        message={item.name}
        onDismiss={() => dispatch({ type: 'dismissNews' })}
        actions={[{ label: 'Yay!', primary: true, onClick: () => dispatch({ type: 'dismissNews' }) }]}
      >
        <div className="mb-3 flex justify-center">{item.art}</div>
      </Dialog>
    </>
  )
}

// A round badge: candy-colored when earned, a dashed outline when not yet.
export function BadgeMedal({ icon, earned, size = 'size-24' }) {
  return (
    <span
      className={`grid ${size} place-items-center rounded-full ${
        earned
          ? 'bg-gradient-to-br from-butter-300 via-pink-300 to-lilac-300 text-ink shadow-[var(--shadow-candy)] ring-4 ring-white'
          : 'border-2 border-dashed border-ink-soft/40 bg-white/60 text-ink-soft'
      }`}
    >
      <Icon name={icon} size={40} />
    </span>
  )
}
