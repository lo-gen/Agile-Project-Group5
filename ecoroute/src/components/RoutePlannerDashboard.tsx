import { useCallback, useEffect, useMemo, useState } from 'react'
import { cities } from '../data/cities'
import { useFlightContext } from '../context/FlightContext'
import type { CabinClass } from '../types'
import { filterCities, getCityCountries } from '../utils/cityFilters'
import {
  createDefaultRoutePlanner,
  type RouteOption,
  type RouteSegment,
  type RouteStrategy,
  londonToHelsinkiExampleRequest,
} from '../routePlanner'
import { fetchOsrmRoadRoute } from '../routePlanner/roadRouting'
import RoutePlannerMap from './RoutePlanner/RoutePlannerMap'

const strategies: Array<{ value: RouteStrategy; label: string }> = [
  { value: 'multi-modal', label: 'Multi-modal' },
  { value: 'direct-flight', label: 'Direct flight' },
  { value: 'drive', label: 'Drive' },
  { value: 'full-train', label: 'Full train' },
]

const cabinClasses: Array<{ value: CabinClass; label: string }> = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First' },
]

function formatDistance(distanceKm: number) {
  return `${distanceKm.toLocaleString('en-GB', { maximumFractionDigits: 0 })} km`
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${remainingMinutes}m`
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

function formatMoney(value: number) {
  const prefix = value >= 0 ? '+' : '−'
  return `${prefix}${Math.abs(value).toLocaleString('en-GB', { maximumFractionDigits: 0 })} kg`
}

function getCityById(id: string) {
  return cities.find((city) => city.id === id) ?? null
}

function cloneSegments(segments: RouteSegment[]) {
  return segments.map((segment) => ({ ...segment }))
}

function recalculateOption(option: RouteOption, directFlightCo2Kg: number) {
  const totals = option.segments.reduce(
    (accumulator, segment) => ({
      totalDistanceKm: accumulator.totalDistanceKm + segment.distanceKm,
      totalTravelTimeMinutes: accumulator.totalTravelTimeMinutes + segment.travelTimeMinutes,
      totalCo2Kg: accumulator.totalCo2Kg + segment.co2Kg,
    }),
    {
      totalDistanceKm: 0,
      totalTravelTimeMinutes: 0,
      totalCo2Kg: 0,
    },
  )

  return {
    ...option,
    totalDistanceKm: Math.round(totals.totalDistanceKm * 10) / 10,
    totalTravelTimeMinutes: Math.max(1, Math.round(totals.totalTravelTimeMinutes / 5) * 5),
    totalCo2Kg: Math.round(totals.totalCo2Kg * 10) / 10,
    savingsVsDirectFlightKg: Math.round((directFlightCo2Kg - totals.totalCo2Kg) * 10) / 10,
  }
}

function scaleOption(option: RouteOption, travelerCount: number, directFlightCo2Kg: number) {
  const safeTravelerCount = Math.max(1, Math.floor(travelerCount))
  const scaledSegments = option.segments.map((segment) => ({
    ...segment,
    co2Kg: Math.round(segment.co2Kg * safeTravelerCount * 10) / 10,
  }))

  return recalculateOption(
    {
      ...option,
      segments: scaledSegments,
      totalCo2Kg: option.totalCo2Kg * safeTravelerCount,
    },
    directFlightCo2Kg * safeTravelerCount,
  )
}

export default function RoutePlannerDashboard() {
  const planner = useMemo(() => createDefaultRoutePlanner(), [])
  const { state: flightState, setGroupSize } = useFlightContext()
  const [originId, setOriginId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [cabinClass, setCabinClass] = useState<CabinClass>(londonToHelsinkiExampleRequest.cabinClass)
  const [strategy, setStrategy] = useState<RouteStrategy>(londonToHelsinkiExampleRequest.strategy)
  const [originCountry, setOriginCountry] = useState('')
  const [destinationCountry, setDestinationCountry] = useState('')
  const [options, setOptions] = useState<RouteOption[]>([])
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const countries = useMemo(() => getCityCountries(cities), [])

  const originCities = useMemo(
    () => filterCities(cities, { query: '', country: originCountry, excludeId: destinationId }),
    [destinationId, originCountry],
  )

  const destinationCities = useMemo(
    () => filterCities(cities, { query: '', country: destinationCountry, excludeId: originId }),
    [destinationCountry, destinationId, originId],
  )

  const planJourney = useCallback(async () => {
    const travelerCount = flightState.groupSize
    const origin = getCityById(originId)
    const destination = getCityById(destinationId)

    const result = planner.buildOptions({
      origin,
      destination,
      cabinClass,
      strategy,
    })

    let nextOptions = result.options.map((option) =>
      scaleOption(option, travelerCount, result.directFlightCo2Kg),
    )

    if (origin && destination) {
      const driveIndex = nextOptions.findIndex((option) => option.strategy === 'drive')
      if (driveIndex >= 0) {
        try {
          const roadRoute = await fetchOsrmRoadRoute(origin, destination)
          const driveOption = nextOptions[driveIndex]
          nextOptions = nextOptions.map((option, optionIndex) => {
            if (optionIndex !== driveIndex) return option

            const updatedSegments = driveOption.segments.map((segment, segmentIndex) =>
              segmentIndex === 0
                ? {
                    ...segment,
                    distanceKm: Math.round(roadRoute.distanceKm * 10) / 10,
                    travelTimeMinutes: Math.max(1, Math.round(roadRoute.durationMinutes / 5) * 5),
                    co2Kg: Math.round(roadRoute.distanceKm * 0.21 * 10) / 10,
                    path: roadRoute.path,
                  }
                : segment,
            )

            return scaleOption(
              {
                ...driveOption,
                segments: updatedSegments,
              },
              travelerCount,
              result.directFlightCo2Kg,
            )
          })
          setStatusMessage(`${result.message} Live road data loaded for the driving route.`)
        } catch {
          setStatusMessage(`${result.message} Live road data is unavailable right now, so the driving route uses a fallback estimate.`)
        }
      } else {
        setStatusMessage(result.message)
      }
    } else {
      setStatusMessage(result.message)
    }

    setOptions(nextOptions)

    if (!nextOptions.length) {
      setActiveRoute(null)
      setSelectedOptionId('')
      return
    }

    const selected = nextOptions.find((option) => option.strategy === strategy) ?? nextOptions[0]
    setSelectedOptionId(selected.id)
    setActiveRoute({
      ...selected,
      segments: cloneSegments(selected.segments),
    })
  }, [cabinClass, destinationId, flightState.groupSize, originId, planner, strategy])

  useEffect(() => {
    void planJourney()
  }, [planJourney])

  const bestOption = options.find((option) => option.isBest) ?? null
  const directFlightCo2Kg = options.find((option) => option.strategy === 'direct-flight')?.totalCo2Kg ?? 0

  const updateActiveRoute = (updater: (route: RouteOption) => RouteOption) => {
    setActiveRoute((current) => {
      if (!current) return current
      return recalculateOption(updater(current), directFlightCo2Kg)
    })
  }

  const handleSelectOption = (option: RouteOption) => {
    setSelectedOptionId(option.id)
    setActiveRoute({
      ...option,
      segments: cloneSegments(option.segments),
    })
  }

  const handleRemoveSegment = (segmentId: string) => {
    updateActiveRoute((route) => ({
      ...route,
      segments: route.segments.filter((segment) => segment.id !== segmentId),
    }))
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-eco-bg font-sans text-eco-text">
      <aside className="flex h-full w-[38%] flex-col gap-4 overflow-y-auto border-r border-eco-border bg-eco-panel p-5">
        <header className="space-y-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-eco-green">EcoRoute Planner</p>
            <h1 className="text-3xl font-semibold text-eco-text">Multi-modal journey planner</h1>
            <p className="mt-1 text-sm text-eco-muted">
              Compare flights, trains, cars, buses, ferries, and walking in one editable trip.
            </p>
          </div>
          {statusMessage ? (
            <div className="rounded-lg border border-eco-border bg-eco-bg px-3 py-2 text-sm text-eco-muted">
              {statusMessage}
            </div>
          ) : null}
        </header>

        <section className="grid gap-3 rounded-xl border border-eco-border bg-eco-bg p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wider text-eco-muted">Starting location</span>
              <select
                value={originCountry}
                onChange={(event) => setOriginCountry(event.target.value)}
                className="rounded-md border border-eco-border bg-eco-panel px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-eco-green"
              >
                <option value="">All countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <select
                value={originId}
                onChange={(event) => setOriginId(event.target.value)}
                className="rounded-md border border-eco-border bg-eco-panel px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-eco-green"
              >
                <option value="">Select city…</option>
                {originCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.country}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wider text-eco-muted">Destination</span>
              <select
                value={destinationCountry}
                onChange={(event) => setDestinationCountry(event.target.value)}
                className="rounded-md border border-eco-border bg-eco-panel px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-eco-green"
              >
                <option value="">All countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <select
                value={destinationId}
                onChange={(event) => setDestinationId(event.target.value)}
                className="rounded-md border border-eco-border bg-eco-panel px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-eco-green"
              >
                <option value="">Select city…</option>
                {destinationCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.country}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wider text-eco-muted">Cabin / travel class</span>
              <select
                value={cabinClass}
                onChange={(event) => setCabinClass(event.target.value as CabinClass)}
                className="rounded-md border border-eco-border bg-eco-panel px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-eco-green"
              >
                {cabinClasses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs font-medium uppercase tracking-wider text-eco-muted">Route strategy</span>
              <select
                value={strategy}
                onChange={(event) => setStrategy(event.target.value as RouteStrategy)}
                className="rounded-md border border-eco-border bg-eco-panel px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-eco-green"
              >
                {strategies.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 rounded-lg border border-eco-border bg-eco-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-eco-muted">Travelers</p>
                <h3 className="text-sm font-semibold text-eco-text">Number of travelers</h3>
              </div>
              <span className="rounded-full border border-eco-border px-3 py-1 text-xs text-eco-muted">
                Scales emissions totals
              </span>
            </div>
            <input
              type="number"
              min={1}
              step={1}
              value={flightState.groupSize}
              onChange={(event) => setGroupSize(Number(event.target.value))}
              className="w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-sm text-eco-text focus:outline-none focus:ring-1 focus:ring-eco-green"
            />
          </div>

          <button
            type="button"
            onClick={() => void planJourney()}
            className="rounded-md bg-eco-green px-4 py-2 text-sm font-semibold text-eco-bg transition hover:opacity-90"
          >
            Plan journey
          </button>
        </section>

        <section className="grid gap-3 rounded-xl border border-eco-border bg-eco-bg p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-eco-muted">Summary</p>
              <h2 className="text-lg font-semibold text-eco-text">
                {activeRoute?.label ?? 'No route selected'}
              </h2>
            </div>
            {bestOption ? (
              <span className="rounded-full border border-eco-green/30 bg-eco-green/10 px-3 py-1 text-xs font-semibold text-eco-green">
                Best option
              </span>
            ) : null}
          </div>

          {activeRoute ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-eco-border bg-eco-panel p-3">
                <p className="text-xs uppercase tracking-wider text-eco-muted">CO₂</p>
                <p className="mt-1 text-xl font-semibold text-eco-text">{activeRoute.totalCo2Kg.toFixed(0)} kg</p>
              </div>
              <div className="rounded-lg border border-eco-border bg-eco-panel p-3">
                <p className="text-xs uppercase tracking-wider text-eco-muted">Savings vs direct flight</p>
                <p className={`mt-1 text-xl font-semibold ${activeRoute.savingsVsDirectFlightKg >= 0 ? 'text-eco-green' : 'text-orange-300'}`}>
                  {formatMoney(activeRoute.savingsVsDirectFlightKg)}
                </p>
              </div>
              <div className="rounded-lg border border-eco-border bg-eco-panel p-3">
                <p className="text-xs uppercase tracking-wider text-eco-muted">Distance</p>
                <p className="mt-1 text-xl font-semibold text-eco-text">{formatDistance(activeRoute.totalDistanceKm)}</p>
              </div>
              <div className="rounded-lg border border-eco-border bg-eco-panel p-3">
                <p className="text-xs uppercase tracking-wider text-eco-muted">Time</p>
                <p className="mt-1 text-xl font-semibold text-eco-text">{formatTime(activeRoute.totalTravelTimeMinutes)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-eco-muted">Generate a route to see totals and comparisons.</p>
          )}
        </section>

        <section className="grid gap-3 rounded-xl border border-eco-border bg-eco-bg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-eco-muted">Comparison</p>
              <h2 className="text-lg font-semibold text-eco-text">Alternative travel options</h2>
            </div>
            <p className="text-xs text-eco-muted">Click a card to edit that route</p>
          </div>

          <div className="grid gap-2">
            {options.map((option) => {
              const selected = selectedOptionId === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`rounded-lg border p-3 text-left transition ${selected ? 'border-eco-green bg-eco-green/10' : 'border-eco-border bg-eco-panel hover:border-eco-green/50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-eco-text">{option.label}</p>
                      <p className="text-xs text-eco-muted">{option.description}</p>
                    </div>
                    {option.isBest ? (
                      <span className="rounded-full bg-eco-green px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-eco-bg">
                        Lowest emissions
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-eco-muted">
                    <span>{formatDistance(option.totalDistanceKm)}</span>
                    <span>{formatTime(option.totalTravelTimeMinutes)}</span>
                    <span>{option.totalCo2Kg.toFixed(0)} kg CO₂</span>
                  </div>
                  <div className="mt-2 text-xs text-eco-muted">
                    {formatMoney(option.savingsVsDirectFlightKg)} vs direct flight
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="grid gap-3 rounded-xl border border-eco-border bg-eco-bg p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-eco-muted">Trip segments</p>
            <h2 className="text-lg font-semibold text-eco-text">Edit the active journey</h2>
          </div>

          {activeRoute ? (
            <div className="grid gap-3">
              {activeRoute.segments.map((segment, index) => (
                <div key={segment.id} className="rounded-lg border border-eco-border bg-eco-panel p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden="true">
                        {segment.icon}
                      </span>
                      <div>
                        <p className="font-semibold text-eco-text">{segment.transportLabel}</p>
                        <p className="text-xs text-eco-muted">Segment {index + 1}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSegment(segment.id)}
                      className="rounded-md border border-eco-border px-2 py-1 text-xs text-eco-text transition hover:border-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-eco-muted">
                    <span>{formatDistance(segment.distanceKm)}</span>
                    <span>{formatTime(segment.travelTimeMinutes)}</span>
                    <span>{segment.co2Kg.toFixed(0)} kg CO₂</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-eco-muted">Generate a route first to edit its segments.</p>
          )}
        </section>
      </aside>

      <main className="h-full w-[62%]">
        <RoutePlannerMap route={activeRoute} />
      </main>
    </div>
  )
}
