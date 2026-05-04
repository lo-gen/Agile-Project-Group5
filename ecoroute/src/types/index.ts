export interface City {
  id: string;
  name: string;
  country: string;
  iata: string;
  lat: number;
  lng: number;
}

export type CabinClass = 'economy' | 'business' | 'first';



export interface EmissionsResult {
  distanceKm: number;
  co2Kg: number;
  co2KgPerKm: number;
  cabinClass?: CabinClass;
  cabinClass: CabinClass
  groupSize: number;
  perPersonCo2Kg: number;
  totalCo2Kg: number;
  equivalentKmByCar: number;
  equivalentKmByTrain: number;
  treesNeededToOffset: number;
}

export type TransportModeType = 'flight' | 'car' | 'train'

export interface JourneyLeg {
  transportMode: TransportModeType;
  startCity: City;
  endCity: City;
  distanceKm: number;
  co2Kg: number;
  cabinClass?: CabinClass;
}

export interface Journey {
  id: string;
  legs: JourneyLeg[];
  totalDistanceKm: number;
  totalCo2Kg: number;
  treesNeededToOffset: number;
}

export interface JourneyOption {
  name: string;
  description: string;
  journey: Journey;
  rank: number;
}

export interface JourneyState {
  journeyOptions: JourneyOption[] | null;
  selectedJourney: Journey | null;
}

export interface JourneyContextValue {
  state: JourneyState
  selectJourney: (journey: Journey | null) => void
  reset: () => void
}

export type JourneyAction =
  | { type: 'SET_JOURNEY_OPTIONS'; payload: JourneyOption[] | null }
  | { type: 'SELECT_JOURNEY'; payload: Journey | null }
  | { type: 'RESET' }

export interface FlightState {
  origin: City | null;
  destination: City | null;
  cabinClass: CabinClass;
  groupSize : number;
  result: EmissionsResult | null;
  flightHistory: SavedFlight[] | null;
  isLoadingHistory: boolean;
}

export type FlightAction =
  | { type: 'SET_ORIGIN'; payload: City | null }
  | { type: 'SET_DESTINATION'; payload: City | null }
  | { type: 'SET_CABIN_CLASS'; payload: CabinClass }
  | { type: 'RESET' }
  | { type: 'SET_FLIGHT_HISTORY'; payload: SavedFlight[] }
  | { type: 'SET_LOADING_HISTORY'; payload: boolean }
  | { type: 'ADD_TO_HISTORY'; payload: SavedFlight }
  | { type: 'REMOVE_FROM_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_GROUP_SIZE'; payload: number };


export interface TransportMode {
  id: string;
  label: string;
  emissionPerKm: number;
  color: string;
}

// Auth types
export interface AuthUser {
  id: string
  email: string
}

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// Flight history types
export interface SavedFlight {
  id: string
  origin_city: string
  destination_city: string
  cabin_class: CabinClass
  emissions_kg: number
  distance_km: number
  created_at: string
}

export interface FlightHistoryContextValue {
  flightHistory: SavedFlight[] | null
  isLoadingHistory: boolean
  saveFlightToHistory: (flight: Omit<SavedFlight, 'id' | 'created_at'>) => Promise<void>
  deleteFlightFromHistory: (id: string) => Promise<void>
  clearFlightHistory: () => Promise<void>
  reloadHistory: () => Promise<void>
}
