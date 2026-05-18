import { useMemo, useState } from 'react'
import { cities } from '../../data/cities_clean'
import { useFlightContext } from '../../context/FlightContext'
import { useLanguage } from '../../context/LanguageContext'
import type { City } from '../../types'
import { filterCities } from '../../utils/cityFilters'

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
  const { t } = useLanguage()
  const selectedLabel = value ? `${value.name}, ${value.country}` : ''
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const inputValue = isSearching ? query : selectedLabel
  const showSuggestions = isSearching && query.trim().length > 0

  const available = useMemo(
    () => filterCities(cities, { query: showSuggestions ? query : '', excludeId: exclude?.id }),
    [showSuggestions, query, exclude?.id],
  )

  const visibleCities = showSuggestions ? available.slice(0, 50) : []

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-eco-muted uppercase tracking-wider">
        {label}
      </label>
      <input
        type="search"
        className="w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-sm text-eco-text focus:outline-none focus:ring-1 focus:ring-eco-green"
        placeholder={t('citySearchPlaceholder')}
        value={inputValue}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsSearching(true)
        }}
        aria-label={t('citySearchAria', { label })}
        autoComplete="off"
      />
      {showSuggestions ? (
        <div className="relative">
          <div className="mt-1 rounded-md border border-eco-border bg-eco-bg shadow-sm">
            {visibleCities.length > 0 ? (
              <>
                <ul
                  role="listbox"
                  className="max-h-72 overflow-y-auto text-sm"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {visibleCities.map((city) => (
                    <li
                      key={city.id}
                      role="option"
                      className="cursor-pointer px-3 py-2 text-eco-text hover:bg-eco-hover"
                      onClick={() => {
                        onChange(city)
                        setQuery(city.name)
                        setIsSearching(false)
                      }}
                    >
                      {city.name}, {city.country} ({city.iata})
                    </li>
                  ))}
                </ul>
                {available.length > 50 ? (
                  <div className="px-3 py-2 text-xs text-eco-muted">
                    {t('cityTopResults')}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="p-3 text-sm text-eco-muted">
                {t('cityNoMatches')}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function CitySelector() {
  const { state, setOrigin, setDestination } = useFlightContext()
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-3">
      <CityDropdown
        label={t('cityFrom')}
        value={state.origin}
        exclude={state.destination}
        onChange={setOrigin}
      />
      <CityDropdown
        label={t('cityTo')}
        value={state.destination}
        exclude={state.origin}
        onChange={setDestination}
      />
    </div>
  )
}
