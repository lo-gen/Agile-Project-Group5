import { useState } from 'react'
import { useFlightContext } from '../../context/FlightContext'
import type { CabinClass } from '../../types'

const CLASSES: { value: CabinClass; label: string }[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
]

export default function TravelClassSelector() {
  const { state, setCabinClass, setGroupSize } = useFlightContext()
  const [groupSizeInput, setGroupSizeInput] = useState(String(state.groupSize))

  const commitGroupSize = () => {
    const digits = groupSizeInput.replace(/\D/g, '')
    const nextSize = digits ? Math.max(1, Number(digits)) : 1
    setGroupSize(nextSize)
    setGroupSizeInput(String(nextSize))
  }

  return (
    <div className="flex flex-col gap-3">
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
                type="button"
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

      <div className="flex flex-col gap-1">
        <label
          htmlFor="group-size"
          className="text-xs font-medium text-eco-muted uppercase tracking-wider"
        >
          Number of travelers
        </label>
        <div className="flex gap-2">
          <input
            id="group-size"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={groupSizeInput}
            onChange={(e) => setGroupSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitGroupSize()
              }
            }}
            className="flex-1 rounded-md border border-eco-border bg-transparent px-3 py-2 text-sm text-eco-text"
          />
          <button
            type="button"
            onClick={commitGroupSize}
            className="rounded-md border border-eco-border bg-eco-green px-3 py-2 text-sm font-semibold text-white transition hover:bg-eco-green/90"
          >
            Calculate
          </button>
        </div>
      </div>
    </div>
  )
}
