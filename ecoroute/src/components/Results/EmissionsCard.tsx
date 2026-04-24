import { useFlightContext } from '../../context/FlightContext'
import type { LegEmission } from '../../types'

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-GB', { maximumFractionDigits: decimals })
}

function formatMode(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

function formatHoursAndMinutes(totalHours: number): string {
  const totalMinutesRaw = Math.max(0, totalHours * 60)
  const totalMinutes = Math.ceil(totalMinutesRaw / 15) * 15
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export default function EmissionsCard() {
  const { state } = useFlightContext()
  if (!state.result) return null

  const { co2Kg, distanceKm, durationHours, equivalentKmByCar, treesNeededToOffset, legs } = state.result
  const flightLegsDistance = legs?.reduce(
    (sum, leg) => sum + (leg.mode === 'flight' ? leg.distanceKm : 0),
    0,
  ) ?? 0

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

      <div className="border-t border-eco-border pt-3 flex flex-col gap-2 text-sm text-eco-muted">
        <p>
          <span className="text-eco-text font-medium">{fmt(distanceKm)} km</span>{' '}
          total trip distance
        </p>
        <p>
          <span className="text-eco-text font-medium">{formatHoursAndMinutes(durationHours)}</span>{' '}
          estimated total travel time
        </p>
        {flightLegsDistance > 0 && (
          <p>
            <span className="text-eco-text font-medium">{fmt(flightLegsDistance)} km</span>{' '}
            flight distance
          </p>
        )}
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

      {legs && legs.length > 0 && (
        <div className="border-t border-eco-border pt-3">
          <p className="text-xs text-eco-muted uppercase tracking-wider mb-2">
            Trip legs
          </p>
          <div className="space-y-3 text-sm text-eco-muted">
            {legs.map((leg: LegEmission, index) => (
              <div key={`${leg.origin}-${leg.destination}-${index}`} className="rounded-md border border-eco-border bg-eco-bg p-3">
                <p className="font-medium text-eco-text">
                  {index + 1}. {leg.origin} → {leg.destination}
                </p>
                <p>
                  {formatMode(leg.mode)} • {fmt(leg.distanceKm)} km •{' '}
                  {formatHoursAndMinutes(leg.durationHours)} •{' '}
                  {fmt(leg.co2Kg, 1)} kg CO₂
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
