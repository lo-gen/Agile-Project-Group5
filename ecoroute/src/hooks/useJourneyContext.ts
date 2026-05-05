import { useContext } from 'react'
import { JourneyContext } from '../context/JourneyContext'
import type { JourneyContextValue } from '../types'

export function useJourneyContext(): JourneyContextValue {
  const ctx = useContext(JourneyContext)
  if (!ctx) throw new Error('useJourneyContext must be used within JourneyProvider')
  return ctx
}
