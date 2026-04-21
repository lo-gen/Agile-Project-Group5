import { cities } from '../../data/cities'
import { useFlightContext } from '../../context/FlightContext'
import type { City } from '../../types'

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

export default function CitySelector() {
  const { state, setOrigin, setDestination } = useFlightContext()

  return (
    <div className="flex flex-col gap-3">
      <CityDropdown
        label="From"
        value={state.origin}
        exclude={state.destination}
        onChange={setOrigin}
      />
      <CityDropdown
        label="To"
        value={state.destination}
        exclude={state.origin}
        onChange={setDestination}
      />
    </div>
  )
}
