export interface City {
  id: string;
  name: string;
  country: string;
  iata: string;
  lat: number;
  lng: number;
}

export type CabinClass = 'economy' | 'business' | 'first';
export type TransportModeId = 'flight' | 'car' | 'train';

export interface LegEmission {
  mode: TransportModeId;
  origin: string;
  destination: string;
  distanceKm: number;
  durationHours: number;
  co2Kg: number;
  co2KgPerKm: number;
  emissionPerKm: number;
  cabinClass: CabinClass;
}

export interface EmissionsResult {
  distanceKm: number;
  durationHours: number;
  co2Kg: number;
  co2KgPerKm: number;
  cabinClass: CabinClass;
  equivalentKmByCar: number;
  equivalentKmByTrain: number;
  treesNeededToOffset: number;
  legs?: LegEmission[];
}

export interface TripLeg {
  id: string;
  origin: City | null;
  destination: City | null;
  mode: TransportModeId;
}

export interface FlightState {
  legs: TripLeg[];
  cabinClass: CabinClass;
  result: EmissionsResult | null;
}

export type FlightAction =
  | { type: 'ADD_LEG' }
  | { type: 'REMOVE_LEG'; payload: string }
  | { type: 'SET_LEG_ORIGIN'; payload: { legId: string; city: City | null } }
  | { type: 'SET_LEG_DESTINATION'; payload: { legId: string; city: City | null } }
  | { type: 'SET_LEG_MODE'; payload: { legId: string; mode: TransportModeId } }
  | { type: 'SET_CABIN_CLASS'; payload: CabinClass }
  | { type: 'RESET' };

export interface TransportMode {
  id: TransportModeId;
  label: string;
  emissionPerKm: number;
  color: string;
}
