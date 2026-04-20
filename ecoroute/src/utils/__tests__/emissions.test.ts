import { describe, it, expect } from 'vitest'
import { calculateFlightEmissions } from '../emissions'
import type { City } from '../../types'

const stockholm: City = {
  id: 'arn', name: 'Stockholm', country: 'Sweden',
  iata: 'ARN', lat: 59.651901, lng: 17.918600,
}
const london: City = {
  id: 'lhr', name: 'London', country: 'United Kingdom',
  iata: 'LHR', lat: 51.4706, lng: -0.461941,
}
const lisbon: City = {
  id: 'lis', name: 'Lisbon', country: 'Portugal',
  iata: 'LIS', lat: 38.7813, lng: -9.13592,
}

describe('calculateFlightEmissions', () => {
  it('returns correct distance including detour factor', () => {
    const result = calculateFlightEmissions(stockholm, london, 'economy')
    // Haversine ≈ 1432 km + 95 = ~1527 km (just over short-haul threshold)
    expect(result.distanceKm).toBeGreaterThan(1500)
    expect(result.distanceKm).toBeLessThan(1600)
  })

  it('uses short-haul emission factor for distances under 1500 km', () => {
    // Stockholm→Copenhagen is well under 1500 km
    const copenhagen: City = {
      id: 'cph', name: 'Copenhagen', country: 'Denmark',
      iata: 'CPH', lat: 55.617900, lng: 12.656000,
    }
    const result = calculateFlightEmissions(stockholm, copenhagen, 'economy')
    // distance ≈ 524 km + 95 = 619 km
    // co2 = 619 * 0.255 * 1.0 * 2.7 = ~426 kg
    expect(result.co2Kg).toBeGreaterThan(400)
    expect(result.co2Kg).toBeLessThan(460)
  })

  it('applies cabin class multiplier correctly', () => {
    const eco      = calculateFlightEmissions(stockholm, london, 'economy')
    const business = calculateFlightEmissions(stockholm, london, 'business')
    const first    = calculateFlightEmissions(stockholm, london, 'first')
    expect(business.co2Kg).toBeCloseTo(eco.co2Kg * 1.5, 0)
    expect(first.co2Kg).toBeCloseTo(eco.co2Kg * 2.0, 0)
  })

  it('applies RFI multiplier of 2.7', () => {
    const result = calculateFlightEmissions(stockholm, london, 'economy')
    const co2PerKm = result.co2Kg / result.distanceKm
    // long-haul factor * 1.0 cabin * 2.7 RFI = 0.195 * 2.7 = 0.5265
    expect(co2PerKm).toBeCloseTo(0.195 * 2.7, 1)
  })

  it('derives car and train equivalents', () => {
    const result = calculateFlightEmissions(lisbon, stockholm, 'economy')
    expect(result.equivalentKmByCar).toBeCloseTo(result.co2Kg / 0.21, 0)
    expect(result.equivalentKmByTrain).toBeCloseTo(result.co2Kg / 0.041, 0)
  })

  it('derives trees needed to offset (ceiling)', () => {
    const result = calculateFlightEmissions(stockholm, london, 'economy')
    expect(result.treesNeededToOffset).toBe(Math.ceil(result.co2Kg / 21))
  })

  it('returns cabinClass in result', () => {
    const result = calculateFlightEmissions(stockholm, london, 'business')
    expect(result.cabinClass).toBe('business')
  })
})
