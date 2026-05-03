import { cities } from '../data/cities'
import type { RouteRequest } from './types'

const london = cities.find((city) => city.id === 'lhr')!
const brussels = cities.find((city) => city.id === 'bru')!
const helsinki = cities.find((city) => city.id === 'hel')!

export const londonToHelsinkiExampleRequest: RouteRequest = {
  origin: london,
  destination: helsinki,
  cabinClass: 'economy',
  strategy: 'multi-modal',
}

export const londonToHelsinkiExampleRoute = {
  strategy: 'multi-modal' as const,
  label: 'London to Helsinki sample',
  description: 'Example data showing a mixed rail-and-air route.',
  segments: [
    {
      transportKind: 'train' as const,
      from: london,
      to: brussels,
    },
    {
      transportKind: 'flight' as const,
      from: brussels,
      to: helsinki,
    },
  ],
}
