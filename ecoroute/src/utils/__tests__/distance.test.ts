import { describe, it, expect } from 'vitest'
import { haversineDistanceKm } from '../distance'

describe('haversineDistanceKm', () => {
  it('returns 0 for identical coordinates', () => {
    const city = { lat: 59.33, lng: 18.07 }
    expect(haversineDistanceKm(city, city)).toBe(0)
  })

  it('calculates Stockholm → London correctly (≈ 1430 km)', () => {
    const stockholm = { lat: 59.651901, lng: 17.918600 }
    const london    = { lat: 51.4706,   lng: -0.461941 }
    const dist = haversineDistanceKm(stockholm, london)
    expect(dist).toBeGreaterThan(1400)
    expect(dist).toBeLessThan(1470)
  })

  it('calculates Lisbon → Athens correctly (≈ 2900 km)', () => {
    const lisbon  = { lat: 38.7813, lng: -9.13592 }
    const athens  = { lat: 37.9364, lng: 23.9445  }
    const dist = haversineDistanceKm(lisbon, athens)
    expect(dist).toBeGreaterThan(2850)
    expect(dist).toBeLessThan(2960)
  })
})
