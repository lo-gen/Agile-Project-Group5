import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { JourneyAction, JourneyContextValue, JourneyState } from '../types'
import { generateJourneyOptions } from '../utils/journeyGenerator'
import { useFlightContext } from './FlightContext'

const initialState: JourneyState = {
  journeyOptions: null,
  selectedJourney: null,
}

function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'SET_JOURNEY_OPTIONS':
      return { ...state, journeyOptions: action.payload }
    case 'SELECT_JOURNEY':
      return { ...state, selectedJourney: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

const JourneyContext = createContext<JourneyContextValue | null>(null)

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(journeyReducer, initialState)
  const { state: flightState } = useFlightContext()

  useEffect(() => {
    if (!flightState.origin || !flightState.destination) {
      dispatch({ type: 'SET_JOURNEY_OPTIONS', payload: null })
      return
    }

    const options = generateJourneyOptions(
      flightState.origin,
      flightState.destination,
      flightState.cabinClass,
    )
    dispatch({ type: 'SET_JOURNEY_OPTIONS', payload: options })
  }, [flightState.origin, flightState.destination, flightState.cabinClass])

  return (
    <JourneyContext.Provider
      value={{
        state,
        selectJourney: (journey) => dispatch({ type: 'SELECT_JOURNEY', payload: journey }),
        reset: () => dispatch({ type: 'RESET' }),
      }}
    >
      {children}
    </JourneyContext.Provider>
  )
}

export function useJourneyContext() {
  const context = useContext(JourneyContext)
  if (!context) {
    throw new Error('useJourneyContext must be used within JourneyProvider')
  }
  return context
}
