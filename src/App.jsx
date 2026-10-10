import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { GameProvider, useGame, playtimeLimit } from './state/GameContext'
import { PlatformContext } from './components/PlatformContext'
import { detectPlatform } from './lib/platform'
import { unlockSpeech } from './lib/speech'
import TitleScreen from './screens/TitleScreen'
import MakerScreen from './screens/MakerScreen'
import ShelfScreen from './screens/ShelfScreen'
import SettingsScreen from './screens/SettingsScreen'
import NapScreen from './screens/NapScreen'
import ParentGate from './components/ParentGate'
import { usePlaytime } from './lib/usePlaytime'
import Celebration from './components/Celebration'

const platform = detectPlatform()
document.documentElement.dataset.platform = platform

export default function App() {
  return (
    <PlatformContext.Provider value={platform}>
      {/* reducedMotion="user" makes every Framer animation respect the OS reduce-motion setting */}
      <MotionConfig reducedMotion="user">
        <GameProvider>
          <Screens />
          <Celebration />
          <PlaytimeReminder />
        </GameProvider>
      </MotionConfig>
    </PlatformContext.Provider>
  )
}

// Navigation uses browser history so Android's system/predictive back and
// Safari's edge swipe step back through the maker naturally.
function Screens() {
  const { state, dispatch } = useGame()
  const [screen, setScreen] = useState('title')
  const [gate, setGate] = useState(false)

  useEffect(() => {
    history.replaceState({ screen: 'title' }, '')
    const onPop = (e) => {
      const s = e.state ?? { screen: 'title' }
      if (s.screen === 'settings') {
        // Settings are only reachable through the parent gate, never by going "forward" in history.
        history.replaceState({ screen: 'title' }, '')
        setScreen('title')
        return
      }
      setScreen(s.screen)
      if (s.screen === 'maker') dispatch({ type: 'setStep', step: s.step })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [dispatch])

  const goToStep = (step) => {
    dispatch({ type: 'setStep', step })
    history.pushState({ screen: 'maker', step }, '')
  }

  // Opens the maker at a step, building the back stack one step at a time.
  const openMaker = (step) => {
    for (let i = 0; i <= step; i++) history.pushState({ screen: 'maker', step: i }, '')
    setScreen('maker')
  }

  if (screen === 'title') {
    return (
      <>
      <TitleScreen
        onGrownUps={() => setGate(true)}
        onPlay={() => {
          unlockSpeech()
          openMaker(state.maker.step) // resume where she left off (autosave)
        }}
        onRandom={() => {
          unlockSpeech()
          dispatch({ type: 'randomSquishy' })
          openMaker(3)
        }}
        onShelf={() => {
          unlockSpeech()
          history.pushState({ screen: 'shelf' }, '')
          setScreen('shelf')
        }}
      />
      {gate && (
        <ParentGate
          onCancel={() => setGate(false)}
          onPass={() => {
            setGate(false)
            history.pushState({ screen: 'settings' }, '')
            setScreen('settings')
          }}
        />
      )}
      </>
    )
  }
  if (screen === 'settings') return <SettingsScreen onBack={() => history.back()} />
  if (screen === 'shelf') {
    return (
      <ShelfScreen
        onBack={() => history.back()}
        onMake={() => openMaker(state.maker.step)}
        onPlay={(id) => {
          dispatch({ type: 'loadSquishy', id })
          openMaker(3)
        }}
      />
    )
  }
  return <MakerScreen onGoToStep={goToStep} onBack={() => history.back()} />
}

// "Your squishies need a nap!" after the grown-up-set playtime (shown over any screen).
function PlaytimeReminder() {
  const { settings } = useGame().state
  const { napping, extend } = usePlaytime(playtimeLimit(settings))
  return napping ? <NapScreen onMoreTime={() => extend(10)} /> : null
}
