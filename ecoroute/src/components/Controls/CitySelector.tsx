import { cities } from '../../data/cities'
import { transportModes } from '../../data/transportModes'
import { useFlightContext } from '../../context/FlightContext'
import type { City, TransportModeId } from '../../types'

function CityDropdown({
  label,
  value,
  exclude,
  onChange,
}: {
  label: string
  value: City | null
  exclude: City | null
  onChange: (city: City | null) => void
}) {
  const available = cities.filter((c) => c.id !== exclude?.id)

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-eco-muted uppercase tracking-wider">
        {label}
      </label>
      <select
        className="w-full bg-eco-bg border border-eco-border text-eco-text rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-eco-green"
        value={value?.id ?? ''}
        onChange={(e) => {
          const selected = cities.find((c) => c.id === e.target.value) ?? null
          onChange(selected)
        }}
      >
        <option value="">Select city…</option>
        {available.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}, {city.country} ({city.iata})
          </option>
        ))}
      </select>
    </div>
  )
}

function ModeDropdown({
  value,
  onChange,
}: {
  value: TransportModeId
  onChange: (mode: TransportModeId) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-eco-muted uppercase tracking-wider">
        Mode
      </label>
      <select
        className="w-full bg-eco-bg border border-eco-border text-eco-text rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-eco-green"
        value={value}
        onChange={(e) => onChange(e.target.value as TransportModeId)}
      >
        {transportModes.map((mode) => (
          <option key={mode.id} value={mode.id}>
            {mode.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function CitySelector() {
  const {
    state,
    addLeg,
    removeLeg,
    setLegOrigin,
    setLegDestination,
    setLegMode,
  } = useFlightContext()

  return (
    <div className="flex flex-col gap-4">
      {state.legs.map((leg, index) => (
        <div key={leg.id} className="rounded-lg border border-eco-border bg-eco-panel p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-eco-muted">Leg {index + 1}</p>
              <p className="text-sm text-eco-text">Select origin, destination, and transport</p>
            </div>
            {state.legs.length > 1 && (
              <button
                type="button"
                className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
                onClick={() => removeLeg(leg.id)}
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CityDropdown
              label="Origin"
              value={leg.origin}
              exclude={leg.destination}
              onChange={(city) => setLegOrigin(leg.id, city)}
            />
            <CityDropdown
              label="Destination"
              value={leg.destination}
              exclude={leg.origin}
              onChange={(city) => setLegDestination(leg.id, city)}
            />
          </div>

          <div className="mt-3 sm:mt-4 sm:grid sm:grid-cols-2 sm:gap-3">
            <ModeDropdown value={leg.mode} onChange={(mode) => setLegMode(leg.id, mode)} />
          </div>
        </div>
      ))}

      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md border border-eco-border px-4 py-2 text-sm font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
        onClick={addLeg}
      >
        Add another leg
      </button>
    </div>
  )
}
