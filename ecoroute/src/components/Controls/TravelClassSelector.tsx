import { useFlightContext } from '../../context/FlightContext'
import { useLanguage } from '../../context/LanguageContext'
import type { CabinClass } from '../../types'

const CLASSES: { value: CabinClass; labelKey: 'travelEconomy' | 'travelBusiness' | 'travelFirst' }[] = [
  { value: 'economy', labelKey: 'travelEconomy' },
  { value: 'business', labelKey: 'travelBusiness' },
  { value: 'first', labelKey: 'travelFirst' },
]

export default function TravelClassSelector() {
  const { state, setCabinClass, setGroupSize } = useFlightContext()
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-eco-muted uppercase tracking-wider">
          {t('travelCabinClass')}
        </span>
        <div className="flex gap-2">
          {CLASSES.map(({ value, labelKey }) => {
            const active = state.cabinClass === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCabinClass(value)}
                className={[
                  'flex-1 py-2 text-sm rounded-md border transition-colors',
                  active
                    ? 'bg-eco-green text-eco-bg border-eco-green font-semibold'
                    : 'bg-transparent text-eco-muted border-eco-border hover:border-eco-green hover:text-eco-text',
                ].join(' ')}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="group-size"
          className="text-xs font-medium text-eco-muted uppercase tracking-wider"
        >
            {t('travelNumberOfTravelers')}
        </label>
        <input
          id="group-size"
          type="number"
          min={1}
          step={1}
          value={state.groupSize}
          onChange={(e) => setGroupSize(Number(e.target.value))}
          className="rounded-md border border-eco-border bg-transparent px-3 py-2 text-sm text-eco-text"
        />
      </div>
    </div>
  )
}
