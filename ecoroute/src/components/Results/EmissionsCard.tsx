import { useFlightContext } from '../../context/FlightContext'

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString('en-GB', { maximumFractionDigits: decimals })
}

export default function EmissionsCard() {
  const { state } = useFlightContext()
  if (!state.result) return null

  const { co2Kg, distanceKm, equivalentKmByCar, treesNeededToOffset } = state.result

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
