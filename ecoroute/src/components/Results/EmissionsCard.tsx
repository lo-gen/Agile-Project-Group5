import { useEffect } from 'react'
import { useFlightContext } from '../../context/FlightContext'
import { useAuth } from '../../context/AuthContext'

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

  // Smoothly increase effective speed with distance
  const minSpeed = 500   // short flights
  const maxSpeed = 830   // long haul cruise
  const scale = 1200     // how quickly it ramps up

  const effectiveSpeedKmh =
    maxSpeed - (maxSpeed - minSpeed) * Math.exp(-distanceKm / scale)

  return distanceKm / effectiveSpeedKmh
}


export default function EmissionsCard() {
  const { state, saveFlightToHistory } = useFlightContext()
  const { user } = useAuth()

  useEffect(() => {
    if (user && state.result && state.origin && state.destination) {
      saveFlightToHistory(
        state.origin.name,
        state.destination.name,
        state.cabinClass,
        state.result.totalEmissions,
        state.result.distance,
      ).catch((err) => {
        console.error('Failed to save flight:', err)
      })
    }
  }, [state.result?.totalEmissions, user?.id, state.origin?.name, state.destination?.name, state.cabinClass, saveFlightToHistory])

  if (!state.result) return null

  const { co2Kg, distanceKm, equivalentKmByCar, treesNeededToOffset } = state.result
  const estimatedFlightDuration = formatHoursAndMinutes(estimateAirborneHours(distanceKm))

  return (
    <div className="bg-eco-panel border border-eco-border rounded-lg p-4 flex flex-col gap-3">
      <div>
        <p className="text-xs text-eco-muted uppercase tracking-wider mb-1">
          CO₂ emissions
        </p>
        <p className="font-mono text-4xl font-medium text-eco-text">
          {fmt(co2Kg)}{' '}
          <span className="text-lg text-eco-muted">kg</span>
        </p>
      </div>

      <div className="border-t border-eco-border pt-3 flex flex-col gap-1 text-sm text-eco-muted">
        <p>
          <span className="text-eco-text font-medium">{fmt(distanceKm)} km</span>{' '}
          flight distance (incl. routing)
        </p>
        <p>
          ≈ {' '}
          <span className="text-eco-text font-medium">{estimatedFlightDuration}</span>{' '}
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
