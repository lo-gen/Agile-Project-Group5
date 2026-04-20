import { useFlightContext } from '../../context/FlightContext'
import type { CabinClass } from '../../types'

const CLASSES: { value: CabinClass; label: string }[] = [
  { value: 'economy',  label: 'Economy'  },
  { value: 'business', label: 'Business' },
  { value: 'first',    label: 'First'    },
]

export default function TravelClassSelector() {
  const { state, setCabinClass } = useFlightContext()

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-eco-muted uppercase tracking-wider">
        Cabin class
      </span>
      <div className="flex gap-2">
        {CLASSES.map(({ value, label }) => {
          const active = state.cabinClass === value
          return (
            <button
              key={value}
              onClick={() => setCabinClass(value)}
              className={[
                'flex-1 py-2 text-sm rounded-md border transition-colors',
                active
                  ? 'bg-eco-green text-eco-bg border-eco-green font-semibold'
                  : 'bg-transparent text-eco-muted border-eco-border hover:border-eco-green hover:text-eco-text',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
