import { useContext } from 'react'
import { FlightContext, type FlightContextValue } from '../context/FlightContext'

export function useFlightContext(): FlightContextValue {
  const ctx = useContext(FlightContext)
  if (!ctx) throw new Error('useFlightContext must be used within FlightProvider')
  return ctx
}
