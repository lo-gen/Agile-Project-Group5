import { useFlightContext } from '../../context/FlightContext'
import { useJourneyContext } from '../../context/JourneyContext'
import { CAR_EMISSION_PER_KM } from '../../utils/constants'
import type { JourneyLeg } from '../../types'

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-GB', { maximumFractionDigits: decimals })
}

function formatHoursAndMinutes(totalHours: number): string {
  const totalMinutesRaw = Math.max(0, totalHours * 60)

  // Round UP to nearest 15 minutes
  const totalMinutes = Math.ceil(totalMinutesRaw / 15) * 15

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`

  return `${hours}h ${minutes}m`
}

function estimateAirborneHours(distanceKm: number): number {
  if (distanceKm <= 0) return 0

  const minSpeed = 500
  const maxSpeed = 830
  const scale = 1200

  const effectiveSpeedKmh =
    maxSpeed - (maxSpeed - minSpeed) * Math.exp(-distanceKm / scale)

  return distanceKm / effectiveSpeedKmh
}

function estimateJourneyHours(legs: JourneyLeg[]): number {
  return legs.reduce((total, leg) => {
    if (leg.transportMode === 'flight') {
      return total + estimateAirborneHours(leg.distanceKm)
    }
    if (leg.transportMode === 'car') {
      return total + leg.distanceKm / 100
    }
    if (leg.transportMode === 'train') {
      return total + leg.distanceKm / 120
    }
    return total
  }, 0)
}

export default function EmissionsCard() {
  const { state: flightState } = useFlightContext()
  const { state: journeyState } = useJourneyContext()

  const journey = journeyState.selectedJourney

  if (!journey && !flightState.result) return null

  const co2Kg = journey ? journey.totalCo2Kg : flightState.result!.co2Kg
  const distanceKm = journey ? journey.totalDistanceKm : flightState.result!.distanceKm
  const equivalentKmByCar = journey
    ? co2Kg / CAR_EMISSION_PER_KM
    : flightState.result!.equivalentKmByCar
  const treesNeededToOffset = journey
    ? journey.treesNeededToOffset
    : flightState.result!.treesNeededToOffset

  const estimatedJourneyDuration = journey
    ? formatHoursAndMinutes(estimateJourneyHours(journey.legs))
    : formatHoursAndMinutes(estimateAirborneHours(distanceKm))

  const journeyDescription = journey ? 'route distance' : 'flight distance (incl. routing)'
  const {
    totalCo2Kg,
    perPersonCo2Kg,
    groupSize,
    distanceKm,
    equivalentKmByCar,
    treesNeededToOffset,
  } = state.result
  const estimatedFlightDuration = formatHoursAndMinutes(estimateAirborneHours(distanceKm))

  return (
    <div className="bg-eco-panel border border-eco-border rounded-lg p-4 flex flex-col gap-3">
      <div>
        <p className="text-xs text-eco-muted uppercase tracking-wider mb-1">
          CO₂ emissions
        </p>
        <p className="font-mono text-4xl font-medium text-eco-text">
          {fmt(totalCo2Kg)}{' '}
          <span className="text-lg text-eco-muted">kg</span>
        </p>
        <p className="text-sm text-eco-muted mt-1">
          {groupSize} traveler{groupSize !== 1 ? 's' : ''} total
        </p>
      </div>

      <div className="border-t border-eco-border pt-3 flex flex-col gap-1 text-sm text-eco-muted">
        <p>
          Per person:{' '}
          <span className="text-eco-text font-medium">{fmt(perPersonCo2Kg)} kg</span>
        </p>
        <p>
          <span className="text-eco-text font-medium">{fmt(distanceKm)} km</span>{' '}
          {journeyDescription}
        </p>
        <p>
          ≈ {' '}
          <span className="text-eco-text font-medium">{estimatedJourneyDuration}</span>{' '}
          total journey time
        </p>
        <p>
          ≈ driving{' '}
          <span className="text-eco-text font-medium">{fmt(equivalentKmByCar)} km</span>{' '}
          by car
        </p>
        <p>
          {treesNeededToOffset} tree{treesNeededToOffset !== 1 ? 's' : ''} needed
          to offset (1 year)
        </p>
      </div>
    </div>
  )
}
