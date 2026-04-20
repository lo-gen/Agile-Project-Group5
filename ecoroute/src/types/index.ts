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
  cabinClass: CabinClass;
  equivalentKmByCar: number;
  equivalentKmByTrain: number;
  treesNeededToOffset: number;
}

export interface FlightState {
  origin: City | null;
  destination: City | null;
  cabinClass: CabinClass;
  result: EmissionsResult | null;
}

export type FlightAction =
  | { type: 'SET_ORIGIN'; payload: City | null }
  | { type: 'SET_DESTINATION'; payload: City | null }
  | { type: 'SET_CABIN_CLASS'; payload: CabinClass }
  | { type: 'RESET' };

export interface TransportMode {
  id: string;
  label: string;
  emissionPerKm: number;
  color: string;
}
