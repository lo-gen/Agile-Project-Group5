import type { RouteSegment } from '../../routePlanner'
import { useLanguage } from '../../context/LanguageContext'


interface Props {
  segments: RouteSegment[]
}

export default function FlightLegsCard({ segments }: Props) {
  const isDirect = segments.length === 1
  const { t } = useLanguage()

  return (
    <div className="bg-eco-panel border border-eco-border rounded-lg p-4 flex flex-col gap-3">
      <p className="text-xs text-eco-muted uppercase tracking-wider">
        {isDirect ? t('legsDirectFlight') : t('legsFlightRoute', { count: segments.length })}
      </p>
      <div className="flex flex-col gap-2">
        {segments.map((seg, idx) => (
          <div key={seg.id} className="flex items-start gap-3">
            <span className="mt-0.5 text-xs text-eco-muted font-mono w-4 shrink-0 text-center">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-semibold text-eco-text">
                  {seg.from.iata}
                </span>
                <span className="text-eco-muted text-xs">→</span>
                <span className="font-mono text-sm font-semibold text-eco-text">
                  {seg.to.iata}
                </span>
              </div>
              <span className="text-xs text-eco-muted truncate">
                {seg.from.name} → {seg.to.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
