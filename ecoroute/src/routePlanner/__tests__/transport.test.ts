import { describe, it, expect } from 'vitest'
import { createDefaultRouteTransportCatalog } from '../transport'
import type { City } from '../../types'

const paris: City = {
  id: 'cdg', name: 'Paris', city: 'Paris', country: 'France',
  iata: 'CDG', lat: 49.0097, lng: 2.5478,
}
const berlin: City = {
  id: 'ber', name: 'Berlin', city: 'Berlin', country: 'Germany',
  iata: 'BER', lat: 52.3667, lng: 13.5033,
}

const input = { from: paris, to: berlin, cabinClass: 'economy' as const }

describe('InMemoryRouteTransportCatalog', () => {
  const catalog = createDefaultRouteTransportCatalog()

  it('lists all 6 transport types', () => {
    expect(catalog.list()).toHaveLength(6)
  })

  it('returns null for an unknown transport id', () => {
    expect(catalog.get('hovercraft')).toBeNull()
  })

  it('lookup is case-insensitive and trims whitespace', () => {
    expect(catalog.get('  FERRY  ')).not.toBeNull()
  })
})

describe('BusTransport', () => {
  const bus = createDefaultRouteTransportCatalog().get('bus')!

  it('estimates a segment with non-zero distance and time', () => {
    const seg = bus.estimate(input)
    expect(seg.distanceKm).toBeGreaterThan(0)
    expect(seg.travelTimeMinutes).toBeGreaterThan(0)
    expect(seg.transportKind).toBe('bus')
  })

  it('calculates co2 at 0.09 kg/km', () => {
    const seg = bus.estimate(input)
    expect(seg.co2Kg).toBeCloseTo(seg.distanceKm * 0.09, 0)
  })
})

describe('FerryTransport', () => {
  const ferry = createDefaultRouteTransportCatalog().get('ferry')!

  it('estimates a segment with non-zero distance and time', () => {
    const seg = ferry.estimate(input)
    expect(seg.distanceKm).toBeGreaterThan(0)
    expect(seg.travelTimeMinutes).toBeGreaterThan(0)
    expect(seg.transportKind).toBe('ferry')
  })

  it('calculates co2 at 0.115 kg/km', () => {
    const seg = ferry.estimate(input)
    expect(seg.co2Kg).toBeCloseTo(seg.distanceKm * 0.115, 0)
  })
})

describe('WalkingTransport', () => {
  const walking = createDefaultRouteTransportCatalog().get('walking')!

  it('estimates a segment with non-zero distance and time', () => {
    const seg = walking.estimate(input)
    expect(seg.distanceKm).toBeGreaterThan(0)
    expect(seg.travelTimeMinutes).toBeGreaterThan(0)
    expect(seg.transportKind).toBe('walking')
  })

  it('produces zero emissions', () => {
    const seg = walking.estimate(input)
    expect(seg.co2Kg).toBe(0)
  })
})

describe('CarTransport', () => {
  const car = createDefaultRouteTransportCatalog().get('car')!

  it('calculates co2 at 0.21 kg/km', () => {
    const seg = car.estimate(input)
    expect(seg.co2Kg).toBeCloseTo(seg.distanceKm * 0.21, 0)
  })
})
