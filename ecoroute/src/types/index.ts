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
  cabinClass: CabinClass
  groupSize: number;
  perPersonCo2Kg: number;
  totalCo2Kg: number;
  equivalentKmByCar: number;
  equivalentKmByTrain: number;
  treesNeededToOffset: number;
}

export interface FlightState {
  origin: City | null;
  destination: City | null;
  cabinClass: CabinClass;
  groupSize : number;
  result: EmissionsResult | null;
  flightHistory: SavedFlight[] | null;
  isLoadingHistory: boolean;
  isLoadingEmissions: boolean;
  emissionError: string | null;
}

export type FlightAction =
  | { type: 'SET_ORIGIN'; payload: City | null }
  | { type: 'SET_DESTINATION'; payload: City | null }
  | { type: 'SET_CABIN_CLASS'; payload: CabinClass }
  | { type: 'SET_GROUP_SIZE'; payload: number }
  | { type: 'SET_EMISSIONS_LOADING'; payload: boolean }
  | { type: 'SET_EMISSIONS_ERROR'; payload: string | null }
  | { type: 'SET_EMISSIONS_RESULT'; payload: EmissionsResult | null }
  | { type: 'RESET' }
  | { type: 'SET_FLIGHT_HISTORY'; payload: SavedFlight[] }
  | { type: 'SET_LOADING_HISTORY'; payload: boolean }
  | { type: 'ADD_TO_HISTORY'; payload: SavedFlight }
  | { type: 'REMOVE_FROM_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' };


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

// Favorites types
export interface SavedFavorite {
  id: string
  origin_city: string
  destination_city: string
  origin_country: string
  destination_country: string
  cabin_class: CabinClass
  route_strategy: string
  created_at: string
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
