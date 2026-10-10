import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { GameProvider, useGame } from './state/GameContext'
import { PlatformContext } from './components/PlatformContext'
import { detectPlatform } from './lib/platform'
import { unlockSpeech } from './lib/speech'
import TitleScreen from './screens/TitleScreen'
import MakerScreen from './screens/MakerScreen'

const platform = detectPlatform()
document.documentElement.dataset.platform = platform

export default function App() {
  return (
    <PlatformContext.Provider value={platform}>
      {/* reducedMotion="user" makes every Framer animation respect the OS reduce-motion setting */}
      <MotionConfig reducedMotion="user">
        <GameProvider>
          <Screens />
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

  if (screen === 'title') {
    return (
      <TitleScreen
        onPlay={() => {
          unlockSpeech()
          // Resume where she left off (autosave), building the back stack step by step.
          for (let i = 0; i <= state.maker.step; i++) history.pushState({ screen: 'maker', step: i }, '')
          setScreen('maker')
        }}
      />
    )
  }
  return <MakerScreen onGoToStep={goToStep} onBack={() => history.back()} />
}
