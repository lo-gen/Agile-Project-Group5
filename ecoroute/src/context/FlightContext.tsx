import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type {
  FlightState,
  FlightAction,
  City,
  CabinClass,
  TripLeg,
  TransportModeId,
} from '../types'
import {
  calculateFlightEmissions,
  calculateCarEmissions,
  calculateTrainEmissions,
} from '../utils/emissions'
import {
  CAR_EMISSION_PER_KM,
  TRAIN_EMISSION_PER_KM,
  TREE_ABSORPTION_KG_PER_YEAR,
} from '../utils/constants'

function createLeg(): TripLeg {
  return {
    id: `leg-${Math.random().toString(36).slice(2, 9)}`,
    origin: null,
    destination: null,
    mode: 'flight',
  }
}

const initialState: FlightState = {
  legs: [createLeg()],
  cabinClass: 'economy',
  result: null,
}

function deriveResult(state: FlightState): FlightState['result'] {
  if (state.legs.length === 0) return null

  const completeLegs = state.legs.every(
    (leg) => leg.origin !== null && leg.destination !== null,
  )
  if (!completeLegs) return null

  const legs = state.legs.map((leg) => {
    const origin = leg.origin!
    const destination = leg.destination!

    const result =
      leg.mode === 'flight'
        ? calculateFlightEmissions(origin, destination, state.cabinClass)
        : leg.mode === 'car'
        ? calculateCarEmissions(origin, destination)
        : calculateTrainEmissions(origin, destination)

    return {
      mode: leg.mode,
      origin: origin.name,
      destination: destination.name,
      distanceKm: result.distanceKm,
      durationHours: result.durationHours,
      co2Kg: result.co2Kg,
      co2KgPerKm: result.co2KgPerKm,
      emissionPerKm: result.co2KgPerKm,
      cabinClass: result.cabinClass,
    }
  })

  const distanceKm = legs.reduce((sum, leg) => sum + leg.distanceKm, 0)
  const co2Kg = legs.reduce((sum, leg) => sum + leg.co2Kg, 0)
  const durationHours = legs.reduce((sum, leg) => sum + leg.durationHours, 0)

  return {
    distanceKm,
    durationHours,
    co2Kg,
    co2KgPerKm: distanceKm > 0 ? co2Kg / distanceKm : 0,
    cabinClass: state.cabinClass,
    equivalentKmByCar:   co2Kg / CAR_EMISSION_PER_KM,
    equivalentKmByTrain: co2Kg / TRAIN_EMISSION_PER_KM,
    treesNeededToOffset: Math.ceil(co2Kg / TREE_ABSORPTION_KG_PER_YEAR),
    legs,
  }
}

function flightReducer(state: FlightState, action: FlightAction): FlightState {
  switch (action.type) {
    case 'ADD_LEG': {
      const next = { ...state, legs: [...state.legs, createLeg()] }
      return { ...next, result: deriveResult(next) }
    }
    case 'REMOVE_LEG': {
      const next = {
        ...state,
        legs: state.legs.filter((leg) => leg.id !== action.payload),
      }
      return { ...next, result: deriveResult(next) }
    }
    case 'SET_LEG_ORIGIN': {
      const next = {
        ...state,
        legs: state.legs.map((leg) =>
          leg.id === action.payload.legId
            ? { ...leg, origin: action.payload.city }
            : leg,
        ),
      }
      return { ...next, result: deriveResult(next) }
    }
    case 'SET_LEG_DESTINATION': {
      const next = {
        ...state,
        legs: state.legs.map((leg) =>
          leg.id === action.payload.legId
            ? { ...leg, destination: action.payload.city }
            : leg,
        ),
      }
      return { ...next, result: deriveResult(next) }
    }
    case 'SET_LEG_MODE': {
      const next = {
        ...state,
        legs: state.legs.map((leg) =>
          leg.id === action.payload.legId
            ? { ...leg, mode: action.payload.mode }
            : leg,
        ),
      }
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
  addLeg: () => void
  removeLeg: (legId: string) => void
  setLegOrigin: (legId: string, city: City | null) => void
  setLegDestination: (legId: string, city: City | null) => void
  setLegMode: (legId: string, mode: TransportModeId) => void
  setCabinClass: (cls: CabinClass) => void
  reset: () => void
}

const FlightContext = createContext<FlightContextValue | null>(null)

export function FlightProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(flightReducer, initialState)

  return (
    <FlightContext.Provider value={{
      state,
      addLeg:          () => dispatch({ type: 'ADD_LEG' }),
      removeLeg:       (legId) => dispatch({ type: 'REMOVE_LEG', payload: legId }),
      setLegOrigin:    (legId, city) => dispatch({ type: 'SET_LEG_ORIGIN', payload: { legId, city } }),
      setLegDestination: (legId, city) => dispatch({ type: 'SET_LEG_DESTINATION', payload: { legId, city } }),
      setLegMode:      (legId, mode) => dispatch({ type: 'SET_LEG_MODE', payload: { legId, mode } }),
      setCabinClass:   (cls)  => dispatch({ type: 'SET_CABIN_CLASS', payload: cls  }),
      reset:           ()     => dispatch({ type: 'RESET' }),
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
