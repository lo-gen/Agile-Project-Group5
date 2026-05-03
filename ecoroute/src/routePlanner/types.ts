import type { City, CabinClass } from '../types'

export type RouteTransportKind = 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'walking'
export type RouteStrategy = 'multi-modal' | 'direct-flight' | 'drive' | 'full-train'

export interface RouteRequest {
  origin: City | null
  destination: City | null
  cabinClass: CabinClass
  strategy: RouteStrategy
}

export interface RouteSegmentInput {
  from: City
  to: City
  cabinClass: CabinClass
}

export interface RouteSegment {
  id: string
  transportKind: RouteTransportKind
  transportLabel: string
  icon: string
  color: string
  from: City
  to: City
  distanceKm: number
  travelTimeMinutes: number
  co2Kg: number
  cabinClass?: CabinClass
  path?: Array<[number, number]>
}

export interface RouteOption {
  id: string
  strategy: RouteStrategy
  label: string
  description: string
  segments: RouteSegment[]
  totalDistanceKm: number
  totalTravelTimeMinutes: number
  totalCo2Kg: number
  savingsVsDirectFlightKg: number
  isBest: boolean
}

export interface RoutePlanResult {
  options: RouteOption[]
  bestOptionId: string
  directFlightCo2Kg: number
  message: string
}

export interface RouteTransport {
  id: RouteTransportKind
  label: string
  icon: string
  color: string
  estimate(input: RouteSegmentInput): RouteSegment
}

export interface RouteTransportCatalog {
  list(): RouteTransport[]
  get(id: string): RouteTransport | null
}
