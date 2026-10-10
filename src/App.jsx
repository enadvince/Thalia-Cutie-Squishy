import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { GameProvider, useGame } from './state/GameContext'
import { PlatformContext } from './components/PlatformContext'
import { detectPlatform } from './lib/platform'
import { unlockSpeech } from './lib/speech'
import TitleScreen from './screens/TitleScreen'
import MakerScreen from './screens/MakerScreen'
import ShelfScreen from './screens/ShelfScreen'
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

  useEffect(() => {
    history.replaceState({ screen: 'title' }, '')
    const onPop = (e) => {
      const s = e.state ?? { screen: 'title' }
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
      <TitleScreen
        onPlay={() => {
          unlockSpeech()
          openMaker(state.maker.step) // resume where she left off (autosave)
        }}
        onShelf={() => {
          unlockSpeech()
          history.pushState({ screen: 'shelf' }, '')
          setScreen('shelf')
        }}
      />
    )
  }
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
