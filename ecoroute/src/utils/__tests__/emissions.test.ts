import { describe, it, expect } from 'vitest'
import { calculateFlightEmissions } from '../emissions'
import type { City } from '../../types'
import { CAR_EMISSION_PER_KM, TRAIN_EMISSION_PER_KM, TREE_ABSORPTION_KG_PER_YEAR } from '../../utils/constants'

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
    expect(result.equivalentKmByCar).toBeCloseTo(result.co2Kg / CAR_EMISSION_PER_KM, 0)
    expect(result.equivalentKmByTrain).toBeCloseTo(result.co2Kg / TRAIN_EMISSION_PER_KM, 0)
  })

  it('derives trees needed to offset (ceiling)', () => {
    const result = calculateFlightEmissions(stockholm, london, 'economy')
    expect(result.treesNeededToOffset).toBe(Math.ceil(result.co2Kg / TREE_ABSORPTION_KG_PER_YEAR))
  })

  it('returns cabinClass in result', () => {
    const result = calculateFlightEmissions(stockholm, london, 'business')
    expect(result.cabinClass).toBe('business')
  })

  it('uses group size 1 as baseline', () => {
    const result = calculateFlightEmissions(stockholm, london, 'economy', 1)
    expect(result.groupSize).toBe(1)
    expect(result.totalCo2Kg).toBeCloseTo(result.perPersonCo2Kg, 6)
  })

  it('scales total emissions for group sizes above 1', () => {
    const solo = calculateFlightEmissions(stockholm, london, 'economy', 1)
    const group = calculateFlightEmissions(stockholm, london, 'economy', 4)
    expect(group.groupSize).toBe(4)
    expect(group.totalCo2Kg).toBeCloseTo(solo.totalCo2Kg * 4, 6)
    expect(group.perPersonCo2Kg).toBeCloseTo(solo.perPersonCo2Kg, 6)
  })

  it('falls back to group size 1 for invalid values', () => {
    const zero = calculateFlightEmissions(stockholm, london, 'economy', 0)
    const negative = calculateFlightEmissions(stockholm, london, 'economy', -3)
    const decimal = calculateFlightEmissions(stockholm, london, 'economy', 2.8)
    const baseline = calculateFlightEmissions(stockholm, london, 'economy', 1)

    expect(zero.groupSize).toBe(1)
    expect(negative.groupSize).toBe(1)
    expect(zero.totalCo2Kg).toBeCloseTo(baseline.totalCo2Kg, 6)
    expect(negative.totalCo2Kg).toBeCloseTo(baseline.totalCo2Kg, 6)
    expect(decimal.groupSize).toBe(2)
  })
})
