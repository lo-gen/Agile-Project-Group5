import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { cities } from '../../data/cities_clean'
import { useFlightContext } from '../../context/FlightContext'
import FlightArc from './FlightArc'
import type { City } from '../../types'
import {
  MAP_CENTER_LAT, MAP_CENTER_LNG, MAP_DEFAULT_ZOOM,
  MARKER_RADIUS_DEFAULT, MARKER_RADIUS_SELECTED,
  COLOR_ORIGIN, COLOR_DESTINATION, COLOR_UNSELECTED,
  COLOR_PANEL_BG, MARKER_STROKE_WEIGHT, TOOLTIP_OFFSET_Y,
} from '../../utils/constants'

function cityColor(city: City, origin: City | null, destination: City | null): string {
  if (city.id === origin?.id)      return COLOR_ORIGIN
  if (city.id === destination?.id) return COLOR_DESTINATION
  return COLOR_UNSELECTED
}

export default function FlightMap() {
  const { state, setOrigin, setDestination } = useFlightContext()
  const { origin, destination } = state
  const [showAirports, setShowAirports] = useState(false)

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
    <div className="relative h-full w-full">
      <MapContainer
        center={[MAP_CENTER_LAT, MAP_CENTER_LNG]}
        zoom={MAP_DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {showAirports && cities.map((city) => {
          const isSelected = city.id === origin?.id || city.id === destination?.id
          return (
            <CircleMarker
              key={city.id}
              center={[city.lat, city.lng]}
              radius={isSelected ? MARKER_RADIUS_SELECTED : MARKER_RADIUS_DEFAULT}
              pathOptions={{
                fillColor: cityColor(city, origin, destination),
                fillOpacity: 1,
                color: COLOR_PANEL_BG,
                weight: MARKER_STROKE_WEIGHT,
              }}
              eventHandlers={{ click: () => handleCityClick(city) }}
            >
              <Tooltip direction="top" offset={[0, TOOLTIP_OFFSET_Y]}>
                {city.name} ({city.iata})
              </Tooltip>
            </CircleMarker>
          )
        })}

        {origin && destination && arcKey && (
          <FlightArc key={arcKey} origin={origin} destination={destination} />
        )}
      </MapContainer>

      <button
        type="button"
        onClick={() => setShowAirports((v) => !v)}
        className="absolute bottom-6 left-4 z-[1000] rounded-md border border-eco-border bg-eco-panel px-3 py-1.5 text-xs font-semibold text-eco-text shadow transition hover:border-eco-green hover:text-eco-green"
      >
        {showAirports ? 'Hide airports' : 'Show airports'}
      </button>
    </div>
  )
}
