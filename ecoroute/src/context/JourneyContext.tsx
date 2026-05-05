import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { JourneyAction, JourneyContextValue, JourneyState } from '../types'
import { generateJourneyOptions } from '../utils/journeyGenerator'
import { FlightContext } from './FlightContext'

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

export { JourneyContext }

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(journeyReducer, initialState)
  const flightContext = useContext(FlightContext)
  if (!flightContext) {
    throw new Error('JourneyProvider must be used within FlightProvider')
  }
  const { state: flightState } = flightContext

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

