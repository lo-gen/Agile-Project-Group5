import { describe, expect, it } from 'vitest'
import { cities } from '../../data/cities_clean'
import { createDefaultRoutePlanner, londonToHelsinkiExampleRequest, londonToHelsinkiExampleRoute } from '../index'

const london = cities.find((city) => city.id === 'lhr')!
const helsinki = cities.find((city) => city.id === 'hel')!

describe('RoutePlannerService', () => {
  const planner = createDefaultRoutePlanner()

  it('builds comparison options for a journey', () => {
    const result = planner.buildOptions({
      origin: london,
      destination: helsinki,
      cabinClass: 'economy',
      strategy: 'multi-modal',
    })

    expect(result.options.length).toBeGreaterThanOrEqual(4)
    expect(result.message).toContain('successfully')
  })

  it('creates a multi-modal route with multiple transport types', () => {
    const result = planner.buildOptions(londonToHelsinkiExampleRequest)
    const multiModal = result.options.find((option) => option.strategy === 'multi-modal')

    expect(multiModal).toBeTruthy()
    expect(new Set(multiModal!.segments.map((segment) => segment.transportKind)).size).toBeGreaterThan(1)
    expect(multiModal!.segments.some((segment) => segment.transportKind === 'flight')).toBe(true)
    expect(multiModal!.segments.some((segment) => segment.transportKind === 'train')).toBe(true)
  })

  it('summarizes totals from all segments', () => {
    const result = planner.buildOptions(londonToHelsinkiExampleRequest)
    const route = result.options.find((option) => option.strategy === 'multi-modal')!

    const segmentDistance = route.segments.reduce((sum, segment) => sum + segment.distanceKm, 0)
    const segmentTime = route.segments.reduce((sum, segment) => sum + segment.travelTimeMinutes, 0)
    const segmentCo2 = route.segments.reduce((sum, segment) => sum + segment.co2Kg, 0)

    expect(route.totalDistanceKm).toBeCloseTo(segmentDistance, 1)
    expect(route.totalTravelTimeMinutes).toBeCloseTo(segmentTime, 0)
    expect(route.totalCo2Kg).toBeCloseTo(segmentCo2, 1)
  })

  it('marks the lowest-emission option as best', () => {
    const result = planner.buildOptions(londonToHelsinkiExampleRequest)
    const best = result.options.find((option) => option.isBest)

    expect(best).toBeTruthy()
    expect(best!.totalCo2Kg).toBe(Math.min(...result.options.map((option) => option.totalCo2Kg)))
  })

  it('splits a segment into two connected segments', () => {
    const flight = planner.estimateSegment('flight', {
      from: london,
      to: helsinki,
      cabinClass: 'economy',
    })

    expect(flight).toBeTruthy()

    const split = planner.splitSegment(flight!)

    expect(split.length).toBe(2)
    expect(split[0].from.id).toBe(london.id)
    expect(split[1].to.id).toBe(helsinki.id)
    expect(split[0].to.id).toBe(split[1].from.id)
  })

  it('exposes the provided London to Helsinki example data', () => {
    expect(londonToHelsinkiExampleRoute.segments.length).toBe(2)
    expect(londonToHelsinkiExampleRoute.segments[0].transportKind).toBe('train')
    expect(londonToHelsinkiExampleRoute.segments[1].transportKind).toBe('flight')
  })

  it('keeps direct-flight option connected from origin to destination', () => {
    const result = planner.buildOptions({
      origin: london,
      destination: helsinki,
      cabinClass: 'economy',
      strategy: 'direct-flight',
    })
    const directFlight = result.options.find((option) => option.strategy === 'direct-flight')!

    expect(directFlight.segments.length).toBeGreaterThan(0)
    expect(directFlight.segments[0].from.id).toBe(london.id)
    expect(directFlight.segments[directFlight.segments.length - 1].to.id).toBe(helsinki.id)

    for (let index = 0; index < directFlight.segments.length - 1; index += 1) {
      expect(directFlight.segments[index].to.id).toBe(directFlight.segments[index + 1].from.id)
    }
  })
})
