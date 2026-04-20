import { useFlightContext } from '../../context/FlightContext'
import { CAR_EMISSION_PER_KM, TRAIN_EMISSION_PER_KM } from '../../utils/constants'

interface BarItem {
  label: string
  co2Kg: number
  color: string
}

function Bar({ label, co2Kg, maxCo2, color }: BarItem & { maxCo2: number }) {
  const pct = maxCo2 > 0 ? (co2Kg / maxCo2) * 100 : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-eco-muted">
        <span>{label}</span>
        <span className="font-mono text-eco-text">{Math.round(co2Kg)} kg</span>
      </div>
      <div className="h-2 bg-eco-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function ComparisonBar() {
  const { state } = useFlightContext()
  if (!state.result) return null

  const { co2Kg, distanceKm } = state.result

  const bars: BarItem[] = [
    { label: 'Flight', co2Kg, color: '#ef4444' },
    { label: 'Car', co2Kg: distanceKm * CAR_EMISSION_PER_KM, color: '#f97316' },
    { label: 'Train', co2Kg: distanceKm * TRAIN_EMISSION_PER_KM, color: '#22c55e' },
  ]

  const maxCo2 = Math.max(...bars.map((b) => b.co2Kg))

  return (
    <div className="bg-eco-panel border border-eco-border rounded-lg p-4 flex flex-col gap-3">
      <p className="text-xs text-eco-muted uppercase tracking-wider">
        Mode comparison
      </p>
      {bars.map((bar) => (
        <Bar key={bar.label} {...bar} maxCo2={maxCo2} />
      ))}
    </div>
  )
}
