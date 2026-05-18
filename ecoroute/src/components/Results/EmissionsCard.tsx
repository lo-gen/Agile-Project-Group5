import { useFlightContext } from '../../context/FlightContext'
import { useLanguage } from '../../context/LanguageContext'

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
  const { state } = useFlightContext()
  const { t } = useLanguage()

  if (!state.origin || !state.destination) return null
  if (state.isLoadingEmissions) {
    return (
      <div className="bg-eco-panel border border-eco-border rounded-lg p-4 text-sm text-eco-muted">
        {t('emissionsFetching')}
      </div>
    )
  }

  if (!state.result) return null

  const {
    totalCo2Kg,
    perPersonCo2Kg,
    groupSize,
    distanceKm,
    equivalentKmByCar,
    treesNeededToOffset,
    isEstimate,
  } = state.result
  const estimatedFlightDuration = formatHoursAndMinutes(estimateAirborneHours(distanceKm))

  return (
    <div className="bg-eco-panel border border-eco-border rounded-lg p-4 flex flex-col gap-3">
      {isEstimate && (
        <p className="text-xs text-amber-400 border border-amber-400/30 bg-amber-400/10 rounded px-2 py-1">
          {t('emissionsEstimateWarning')}
        </p>
      )}
      <div>
        <p className="text-xs text-eco-muted uppercase tracking-wider mb-1">
          {t('emissionsTitle')}
        </p>
        <p className="font-mono text-4xl font-medium text-eco-text">
          {fmt(totalCo2Kg)}{' '}
          <span className="text-lg text-eco-muted">kg</span>
        </p>
        <p className="text-sm text-eco-muted mt-1">
          {groupSize} {t('emissionsTravelersTotal', { suffix: groupSize !== 1 ? 's' : '' })}
        </p>
      </div>

      <div className="border-t border-eco-border pt-3 flex flex-col gap-1 text-sm text-eco-muted">
        <p>
          {t('emissionsPerPerson')}{' '}
          <span className="text-eco-text font-medium">{fmt(perPersonCo2Kg)} kg</span>
        </p>
        <p>
          <span className="text-eco-text font-medium">{fmt(distanceKm)} km</span>{' '}
          {t('emissionsFlightDistance')}
        </p>
        <p>
          ≈ {' '}
          <span className="text-eco-text font-medium">{estimatedFlightDuration}</span>{' '}
        </p>
        <p>
          ≈ {' '}
          <span className="text-eco-text font-medium">{fmt(equivalentKmByCar)} km</span>{' '}
          {t('emissionsDrivingEquivalent')}
        </p>
        <p>
          {treesNeededToOffset} {t('emissionsTreesNeeded', { suffix: treesNeededToOffset !== 1 ? 's' : '' })}
        </p>
      </div>
    </div>
  )
}
