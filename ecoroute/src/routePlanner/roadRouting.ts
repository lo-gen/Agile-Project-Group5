import type { City } from '../types'

export interface RoadRouteResult {
  distanceKm: number
  durationMinutes: number
  path: Array<[number, number]>
  summary: string
}

interface OsrmResponse {
  code: string
  routes?: Array<{
    distance: number
    duration: number
    geometry?: {
      coordinates: Array<[number, number]>
      type: 'LineString'
    }
    legs?: Array<{
      summary?: string
    }>
  }>
  message?: string
}

function resolveOsrmBaseUrl() {
  return import.meta.env.VITE_OSRM_BASE_URL?.trim() || 'https://router.project-osrm.org'
}

function toLonLat(city: City) {
  return `${city.lng},${city.lat}`
}

export async function fetchOsrmRoadRoute(from: City, to: City): Promise<RoadRouteResult> {
  const baseUrl = resolveOsrmBaseUrl()
  const url = `${baseUrl}/route/v1/driving/${toLonLat(from)};${toLonLat(to)}?overview=full&geometries=geojson&steps=false`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`OSRM request failed with HTTP ${response.status}`)
  }

  const data = (await response.json()) as OsrmResponse
  const route = data.routes?.[0]

  if (!route || data.code !== 'Ok') {
    throw new Error(data.message || 'OSRM did not return a usable route')
  }

  return {
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
    path: route.geometry?.coordinates.map(([lng, lat]) => [lat, lng]) ?? [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ],
    summary: route.legs?.[0]?.summary || `${from.name} → ${to.name}`,
  }
}
