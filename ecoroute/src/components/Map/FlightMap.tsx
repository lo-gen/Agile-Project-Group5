import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { cities } from '../../data/cities'
import { useFlightContext } from '../../context/FlightContext'
import FlightArc from './FlightArc'
import type { City } from '../../types'
import {
  MAP_CENTER_LAT, MAP_CENTER_LNG, MAP_DEFAULT_ZOOM,
  MARKER_RADIUS_DEFAULT, MARKER_RADIUS_SELECTED,
} from '../../utils/constants'

function cityColor(city: City, origin: City | null, destination: City | null): string {
  if (city.id === origin?.id)      return '#22c55e'
  if (city.id === destination?.id) return '#ef4444'
  return '#94a3b8'
}

export default function FlightMap() {
  const { state, setOrigin, setDestination } = useFlightContext()
  const { origin, destination } = state

  function handleCityClick(city: City) {
    if (city.id === origin?.id) {
      setOrigin(null)
      return
    }
    if (city.id === destination?.id) {
      setDestination(null)
      return
    }
    if (!origin) {
      setOrigin(city)
    } else {
      setDestination(city)
    }
  }

  const arcKey = origin && destination ? `${origin.id}-${destination.id}` : null

  return (
    <MapContainer
      center={[MAP_CENTER_LAT, MAP_CENTER_LNG]}
      zoom={MAP_DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {cities.map((city) => {
        const isSelected = city.id === origin?.id || city.id === destination?.id
        return (
          <CircleMarker
            key={city.id}
            center={[city.lat, city.lng]}
            radius={isSelected ? MARKER_RADIUS_SELECTED : MARKER_RADIUS_DEFAULT}
            pathOptions={{
              fillColor: cityColor(city, origin, destination),
              fillOpacity: 1,
              color: '#0f1117',
              weight: 1,
            }}
            eventHandlers={{ click: () => handleCityClick(city) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {city.name} ({city.iata})
            </Tooltip>
          </CircleMarker>
        )
      })}

      {origin && destination && arcKey && (
        <FlightArc key={arcKey} origin={origin} destination={destination} />
      )}
    </MapContainer>
  )
}
