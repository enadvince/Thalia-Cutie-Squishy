import { createContext, useContext } from 'react'

export const PlatformContext = createContext('android')
export const usePlatform = () => useContext(PlatformContext)
