import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from 'react-leaflet'
import type { RouteOption } from '../../routePlanner'

const mapCenter: [number, number] = [54, 15]

function uniqueCities(route: RouteOption | null) {
  if (!route) return []

  const ordered: Array<RouteOption['segments'][number]['from']> = []
  const seen = new Set<string>()

  route.segments.forEach((segment) => {
    if (!seen.has(segment.from.id)) {
      ordered.push(segment.from)
      seen.add(segment.from.id)
    }
    if (!seen.has(segment.to.id)) {
      ordered.push(segment.to)
      seen.add(segment.to.id)
    }
  })

  return ordered
}

export default function RoutePlannerMap({ route }: { route: RouteOption | null }) {
  const routeCities = uniqueCities(route)

  return (
    <div className="relative h-full w-full bg-[#0b1220]">
      <MapContainer center={mapCenter} zoom={4} style={{ height: '100%', width: '100%' }} zoomControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {route?.segments.map((segment) => (
          <Polyline
            key={segment.id}
            positions={segment.path ?? [
              [segment.from.lat, segment.from.lng],
              [segment.to.lat, segment.to.lng],
            ]}
            pathOptions={{
              color: segment.color,
              weight: 5,
              opacity: 0.9,
              dashArray: segment.transportKind === 'flight' ? '10 10' : undefined,
            }}
          >
            <Tooltip sticky>
              <div className="text-sm">
                <strong>
                  {segment.icon} {segment.transportLabel}
                </strong>
                <div>
                  {segment.from.name} → {segment.to.name}
                </div>
                <div>
                  {segment.distanceKm.toFixed(0)} km · {segment.travelTimeMinutes} min · {segment.co2Kg.toFixed(0)} kg CO₂
                </div>
              </div>
            </Tooltip>
          </Polyline>
        ))}

        {routeCities.map((city, index) => (
          <CircleMarker
            key={city.id}
            center={[city.lat, city.lng]}
            radius={index === 0 || index === routeCities.length - 1 ? 8 : 6}
            pathOptions={{
              color: index === 0 ? '#22c55e' : index === routeCities.length - 1 ? '#ef4444' : '#94a3b8',
              fillColor: index === 0 ? '#22c55e' : index === routeCities.length - 1 ? '#ef4444' : '#94a3b8',
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {city.name}, {city.country}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/10 bg-black/60 p-3 text-sm text-white shadow-lg backdrop-blur">
        <p className="text-xs uppercase tracking-wider text-white/60">Route map</p>
        <p className="mt-1 font-semibold">Different colors = different transport segments</p>
        <p className="mt-1 text-xs text-white/70">
          Each segment can be edited, split, or removed from the planner panel.
        </p>
      </div>
    </div>
  )
}
