import type { City } from '../types'

export function getCityCountries(cities: City[]) {
  return Array.from(new Set(cities.map((city) => city.country))).sort((left, right) =>
    left.localeCompare(right),
  )
}

export function filterCities(
  cities: City[],
  options: {
    query: string
    country: string
    excludeId?: string | null
  },
) {
  const normalizedQuery = options.query.trim().toLowerCase()

  return cities.filter((city) => {
    if (options.excludeId && city.id === options.excludeId) {
      return false
    }

    if (options.country && city.country !== options.country) {
      return false
    }

    if (!normalizedQuery) {
      return true
    }

    return [city.name, city.country, city.iata].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    )
  })
}