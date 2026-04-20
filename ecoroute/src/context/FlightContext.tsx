import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { FlightState, FlightAction, City, CabinClass } from '../types'
import { calculateFlightEmissions } from '../utils/emissions'

const initialState: FlightState = {
  origin:      null,
  destination: null,
  cabinClass:  'economy',
  result:      null,
}

function deriveResult(state: FlightState): FlightState['result'] {
  if (state.origin && state.destination) {
    return calculateFlightEmissions(state.origin, state.destination, state.cabinClass)
  }
  return null
}

function flightReducer(state: FlightState, action: FlightAction): FlightState {
  switch (action.type) {
    case 'SET_ORIGIN': {
      const next = { ...state, origin: action.payload }
      return { ...next, result: deriveResult(next) }
    }
    case 'SET_DESTINATION': {
      const next = { ...state, destination: action.payload }
      return { ...next, result: deriveResult(next) }
    }
    case 'SET_CABIN_CLASS': {
      const next = { ...state, cabinClass: action.payload }
      return { ...next, result: deriveResult(next) }
    }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface FlightContextValue {
  state: FlightState
  setOrigin: (city: City | null) => void
  setDestination: (city: City | null) => void
  setCabinClass: (cls: CabinClass) => void
  reset: () => void
}

const FlightContext = createContext<FlightContextValue | null>(null)

export function FlightProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(flightReducer, initialState)

  return (
    <FlightContext.Provider value={{
      state,
      setOrigin:      (city) => dispatch({ type: 'SET_ORIGIN',      payload: city }),
      setDestination: (city) => dispatch({ type: 'SET_DESTINATION', payload: city }),
      setCabinClass:  (cls)  => dispatch({ type: 'SET_CABIN_CLASS', payload: cls  }),
      reset:          ()     => dispatch({ type: 'RESET' }),
    }}>
      {children}
    </FlightContext.Provider>
  )
}

export function useFlightContext(): FlightContextValue {
  const ctx = useContext(FlightContext)
  if (!ctx) throw new Error('useFlightContext must be used within FlightProvider')
  return ctx
}
