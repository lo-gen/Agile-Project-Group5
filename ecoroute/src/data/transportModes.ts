import type { TransportMode } from '../types'

export const transportModes: TransportMode[] = [
  {
    id: 'flight',
    label: 'Flight',
    emissionPerKm: 0,   // computed dynamically per route by calculateFlightEmissions
    color: '#ef4444',
  },
  {
    id: 'car',
    label: 'Car',
    emissionPerKm: 0.21,
    color: '#f97316',
  },
  {
    id: 'train',
    label: 'Train',
    emissionPerKm: 0.041,
    color: '#22c55e',
  },
]
