import type { JourneyLeg } from '../../types'

interface JourneyLegCardProps {
  leg: JourneyLeg
}

function getTransportStyles(mode: string) {
  switch (mode) {
    case 'flight':
      return 'border-red-500 bg-red-500/10 text-red-300'
    case 'car':
      return 'border-orange-500 bg-orange-500/10 text-orange-300'
    case 'train':
      return 'border-eco-green bg-eco-green/10 text-eco-green'
    default:
      return 'border-eco-border bg-eco-panel text-eco-text'
  }
}

function getTransportLabel(leg: JourneyLeg) {
  if (leg.transportMode === 'flight') {
    return `Flight (${leg.cabinClass ?? 'economy'})`
  }
  if (leg.transportMode === 'car') return 'Drive'
  return 'Train'
}

export default function JourneyLegCard({ leg }: JourneyLegCardProps) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${getTransportStyles(leg.transportMode)}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-eco-muted">{getTransportLabel(leg)}</div>
          <div className="font-semibold text-eco-text">
            {leg.startCity.name} → {leg.endCity.name}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-eco-muted">
            {leg.distanceKm.toLocaleString('en-US', { maximumFractionDigits: 0 })} km
          </div>
          <div className="font-semibold text-eco-text">
            {leg.co2Kg.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg CO₂
          </div>
        </div>
      </div>
    </div>
  )
}
