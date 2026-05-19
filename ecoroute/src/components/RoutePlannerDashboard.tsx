import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cities } from '../data/cities_clean'
import { useFlightContext } from '../context/FlightContext'
import { useAuth } from '../context/AuthContext'
import { haversineDistanceKm } from '../utils/distance'
import { useFavorites } from '../hooks/useFavorites'
import { createDefaultRoutePlanner } from '../routePlanner'
import CitySelector from './Controls/CitySelector'
import TravelClassSelector from './Controls/TravelClassSelector'
import EmissionsCard from './Results/EmissionsCard'
import ComparisonBar from './Results/ComparisonBar'
import FlightLegsCard from './Results/FlightLegsCard'
import GlobeMap from './Map/GlobeMap'
import FlightMap from './Map/FlightMap'

function getNearestCity(userLat: number, userLng: number) {
  let nearestCity = cities[0]
  let minDistance = haversineDistanceKm(
    { lat: userLat, lng: userLng },
    { lat: nearestCity.lat, lng: nearestCity.lng },
  )
  for (const city of cities) {
    const distance = haversineDistanceKm(
      { lat: userLat, lng: userLng },
      { lat: city.lat, lng: city.lng },
    )
    if (distance < minDistance) {
      minDistance = distance
      nearestCity = city
    }
  }
  return nearestCity
}

export default function RoutePlannerDashboard() {
  const { state, setOrigin, setDestination, setCabinClass, saveFlightToHistory } = useFlightContext()
  const { user } = useAuth()
  const { favorites, saveFavorite, deleteFavorite } = useFavorites()
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [isMapVisible, setIsMapVisible] = useState(true)
  const [useGlobe, setUseGlobe] = useState(false)
  const [showAirports, setShowAirports] = useState(false)
  const [sidebarPct, setSidebarPct] = useState(38)
  const planner = useMemo(() => createDefaultRoutePlanner(), [])

  const flightSegments = useMemo(() => {
    if (!state.origin || !state.destination) return null
    const result = planner.buildOptions({
      origin: state.origin,
      destination: state.destination,
      cabinClass: state.cabinClass,
      strategy: 'direct-flight',
    })
    return result.options.find((o) => o.strategy === 'direct-flight')?.segments ?? null
  }, [state.origin, state.destination, state.cabinClass, planner])

  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return
      const { left, width } = containerRef.current.getBoundingClientRect()
      const pct = ((e.clientX - left) / width) * 100
      setSidebarPct(Math.min(Math.max(pct, 38), 70))
    }
    const onMouseUp = () => { isDragging.current = false }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocation is not supported by this browser.')
      return
    }
    setIsLoadingLocation(true)
    setStatusMessage('Getting your current location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const nearestCity = getNearestCity(latitude, longitude)
        setOrigin(nearestCity)
        setStatusMessage(`Using your current location: ${nearestCity.name}, ${nearestCity.country}`)
        setIsLoadingLocation(false)
      },
      (error) => {
        let errorMessage = 'Unable to get your location.'
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access denied. Please allow location access to use this feature.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.'
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.'
        }
        setStatusMessage(errorMessage)
        setIsLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }, [setOrigin])

  const handleSaveToHistory = useCallback(async () => {
    if (!state.origin || !state.destination || !state.result) return
    await saveFlightToHistory(
      state.origin.name,
      state.destination.name,
      state.cabinClass,
      state.result.totalCo2Kg,
      state.result.distanceKm,
    )
    setStatusMessage('Flight saved to history.')
  }, [state, saveFlightToHistory])

  const handleSaveFavorite = useCallback(async () => {
    if (!state.origin || !state.destination) return
    await saveFavorite({
      originCity: state.origin.name,
      destinationCity: state.destination.name,
      originCountry: state.origin.country,
      destinationCountry: state.destination.country,
      cabinClass: state.cabinClass,
      routeStrategy: 'direct-flight',
    })
    setStatusMessage('Saved as favorite.')
  }, [state, saveFavorite])

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden bg-eco-bg font-sans text-eco-text select-none"
    >
      <aside
        style={{ width: isMapVisible ? `${sidebarPct}%` : '100%' }}
        className="flex h-full flex-col gap-4 overflow-y-auto hide-scrollbar bg-eco-panel p-5 shrink-0"
      >
        <header className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-eco-green">
                EcoRoute Planner
              </p>
              <h1 className="text-3xl font-semibold text-eco-text">
                Flight emissions planner
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setIsMapVisible((v) => !v)}
              className="mt-1 shrink-0 rounded-md border border-eco-border px-3 py-1.5 text-xs font-semibold text-eco-text transition hover:border-eco-green hover:text-eco-green"
            >
              {isMapVisible ? 'Hide map' : 'Show map'}
            </button>
          </div>
          {statusMessage && (
            <div className="rounded-lg border border-eco-border bg-eco-bg px-3 py-2 text-sm text-eco-muted">
              {statusMessage}
            </div>
          )}
        </header>

        {user && favorites.length > 0 && (
          <section className="grid gap-2 rounded-xl border border-eco-border bg-eco-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-eco-muted">
              Favorites
            </p>
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-eco-border bg-eco-panel px-3 py-2 text-sm"
              >
                <span className="text-eco-text">
                  {fav.origin_city} → {fav.destination_city}
                  <span className="ml-1 text-xs text-eco-muted capitalize">
                    ({fav.cabin_class})
                  </span>
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const origin = cities.find((c) => c.name === fav.origin_city) ?? null
                      const destination = cities.find((c) => c.name === fav.destination_city) ?? null
                      setOrigin(origin)
                      setDestination(destination)
                      setCabinClass(fav.cabin_class)
                    }}
                    className="rounded border border-eco-border px-2 py-0.5 text-xs text-eco-text transition hover:border-eco-green hover:text-eco-green"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteFavorite(fav.id)}
                    className="rounded border border-eco-border px-2 py-0.5 text-xs text-eco-muted transition hover:border-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="grid gap-3 rounded-xl border border-eco-border bg-eco-bg p-4">
          <CitySelector />
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            className="rounded-md border border-eco-green bg-eco-green px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-eco-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingLocation ? 'Getting location...' : 'Use Current Location'}
          </button>
        </section>

        <section className="rounded-xl border border-eco-border bg-eco-bg p-4">
          <TravelClassSelector />
        </section>

        {user && state.origin && state.destination && (
          <div className="flex gap-2">
            {state.result && (
              <button
                type="button"
                onClick={() => void handleSaveToHistory()}
                className="flex-1 rounded-md bg-eco-green px-4 py-2 text-sm font-semibold text-eco-bg transition hover:opacity-90"
              >
                Save to history
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleSaveFavorite()}
              className="flex-1 rounded-md border border-eco-border px-4 py-2 text-sm font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
            >
              Save as favorite
            </button>
          </div>
        )}

        <EmissionsCard />
        {flightSegments && <FlightLegsCard segments={flightSegments} />}
        <ComparisonBar />
      </aside>

      {isMapVisible && (
        <>
          <div
            className="w-1 shrink-0 cursor-col-resize bg-eco-border transition-colors hover:bg-eco-green/50"
            onMouseDown={() => { isDragging.current = true }}
          />
          <main className="relative h-full min-w-0 flex-1">
            {useGlobe
              ? <GlobeMap segments={flightSegments} showAirports={showAirports} onToggleAirports={() => setShowAirports(v => !v)} />
              : <FlightMap segments={flightSegments} showAirports={showAirports} onToggleAirports={() => setShowAirports(v => !v)} />}
            <button
              type="button"
              onClick={() => setUseGlobe(v => !v)}
              className="absolute right-4 top-4 z-[1000] rounded-md border border-eco-border bg-eco-panel px-3 py-1.5 text-xs font-semibold text-eco-text shadow transition hover:border-eco-green hover:text-eco-green"
            >
              {useGlobe ? 'Flat map' : 'Globe'}
            </button>
          </main>
        </>
      )}
    </div>
  )
}