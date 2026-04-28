import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { FlightState, FlightAction, City, CabinClass, SavedFlight } from '../types'
import { calculateFlightEmissions } from '../utils/emissions'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const initialState: FlightState = {
  origin:           null,
  destination:      null,
  cabinClass:       'economy',
  result:           null,
  flightHistory:    null,
  isLoadingHistory: false,
  groupSize: 1
}

function deriveResult(state: FlightState): FlightState['result'] {
  if (state.origin && state.destination) {
    return calculateFlightEmissions(state.origin, state.destination, state.cabinClass, state.groupSize)
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

    case 'SET_GROUP_SIZE' : {
      const safeGroupSize = Math.max(1, Math.floor(action.payload))
      const next = {...state, groupSize: safeGroupSize}
      return{...next,result: deriveResult(next)}
    }

    case 'RESET':
      return initialState
    case 'SET_FLIGHT_HISTORY':
      return { ...state, flightHistory: action.payload }
    case 'SET_LOADING_HISTORY':
      return { ...state, isLoadingHistory: action.payload }
    case 'ADD_TO_HISTORY': {
      const current = state.flightHistory || []
      return { ...state, flightHistory: [action.payload, ...current] }
    }
    case 'REMOVE_FROM_HISTORY': {
      const filtered = state.flightHistory?.filter((f) => f.id !== action.payload) ?? null
      return { ...state, flightHistory: filtered && filtered.length > 0 ? filtered : null }
    }
    case 'CLEAR_HISTORY':
      return { ...state, flightHistory: null }
    default:
      return state
  }
}

interface FlightContextValue {
  state: FlightState
  setGroupSize: (size: number) => void
 
  setOrigin: (city: City | null) => void
  setDestination: (city: City | null) => void
  setCabinClass: (cls: CabinClass) => void
  reset: () => void
  setFlightHistory: (flights: SavedFlight[]) => void
  addToHistory: (flight: SavedFlight) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  saveFlightToHistory: (originCity: string, destCity: string, cabinClass: CabinClass, emissionsKg: number, distanceKm: number) => Promise<void>
}

const FlightContext = createContext<FlightContextValue | null>(null)

export function FlightProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(flightReducer, initialState)
  const { user } = useAuth()

  const saveFlightToHistory = async (
    originCity: string,
    destCity: string,
    cabinClass: CabinClass,
    emissionsKg: number,
    distanceKm: number,
  ) => {
    if (!user) return

    try {
      const { data, error } = await supabase.from('flights').insert([
        {
          user_id: user.id,
          origin_city: originCity,
          destination_city: destCity,
          cabin_class: cabinClass,
          emissions_kg: emissionsKg,
          distance_km: distanceKm,
          created_at: new Date().toISOString(),
        },
      ]).select()

      if (error) throw error
      if (data?.[0]) {
        dispatch({
          type: 'ADD_TO_HISTORY',
          payload: data[0] as SavedFlight,
        })
      }
    } catch (err) {
      console.error('Failed to save flight to history:', err)
    }
  }

  return (
    <FlightContext.Provider value={{
      state,
      setGroupSize: (size) => dispatch({ type: 'SET_GROUP_SIZE', payload: size }),

      setOrigin:        (city) => dispatch({ type: 'SET_ORIGIN',        payload: city }),
      setDestination:   (city) => dispatch({ type: 'SET_DESTINATION',   payload: city }),
      setCabinClass:    (cls)  => dispatch({ type: 'SET_CABIN_CLASS',   payload: cls  }),
      reset:            ()     => dispatch({ type: 'RESET' }),
      setFlightHistory: (flights) => dispatch({ type: 'SET_FLIGHT_HISTORY', payload: flights }),
      addToHistory:     (flight) => dispatch({ type: 'ADD_TO_HISTORY', payload: flight }),
      removeFromHistory: (id) => dispatch({ type: 'REMOVE_FROM_HISTORY', payload: id }),
      clearHistory:     () => dispatch({ type: 'CLEAR_HISTORY' }),
      saveFlightToHistory,
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
