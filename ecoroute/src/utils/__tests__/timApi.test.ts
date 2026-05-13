import { describe, expect, it } from 'vitest'
import { getTypicalEmissions } from '../timApi'

const sampleMarkets = [
  { origin: 'NAN', destination: 'BOS' },
  { origin: 'BOS', destination: 'NAN' },
]

describe('getTypicalEmissions', () => {
  const apiKey = import.meta.env.VITE_TIM_API_KEY?.trim()

  ;(apiKey ? it : it.skip)('calls the real TIM API for a known market pair', async () => {
    for (const market of sampleMarkets) {
      const response = await getTypicalEmissions(market.origin, market.destination)

      expect(response.typicalFlightEmissions.length).toBeGreaterThan(0)
      
      for (const result of response.typicalFlightEmissions) {
        expect(result.market).toEqual(market)
        console.log(result)
        expect(result.emissionsGramsPerPax).toMatchObject({
          first: expect.any(Number),
          business: expect.any(Number),
          premiumEconomy: expect.any(Number),
          economy: expect.any(Number),
        })
      }
    }
  }, 30000)
})