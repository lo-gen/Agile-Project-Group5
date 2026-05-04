import { afterEach, describe, expect, it, vi } from 'vitest'
import { cities } from '../../data/cities'
import { fetchOsrmRoadRoute } from '../roadRouting'

const london = cities.find((city) => city.id === 'lhr')!
const brussels = cities.find((city) => city.id === 'bru')!

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchOsrmRoadRoute', () => {
  it('parses OSRM route distance, duration, and geometry', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'Ok',
          routes: [
            {
              distance: 345600,
              duration: 14400,
              geometry: {
                type: 'LineString',
                coordinates: [
                  [london.lng, london.lat],
                  [brussels.lng, brussels.lat],
                ],
              },
              legs: [{ summary: 'A1 / E40' }],
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const result = await fetchOsrmRoadRoute(london, brussels)

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(result.distanceKm).toBeCloseTo(345.6, 1)
    expect(result.durationMinutes).toBeCloseTo(240, 0)
    expect(result.path).toHaveLength(2)
    expect(result.summary).toContain('A1')
  })
})
