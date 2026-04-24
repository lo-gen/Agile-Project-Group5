import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { cities } from '../../data/cities'
import { useFlightContext } from '../../context/FlightContext'
import FlightArc from './FlightArc'
import type { City } from '../../types'
import {
  MAP_CENTER_LAT, MAP_CENTER_LNG, MAP_DEFAULT_ZOOM,
  MARKER_RADIUS_DEFAULT, MARKER_RADIUS_SELECTED,
  COLOR_ORIGIN, COLOR_DESTINATION, COLOR_UNSELECTED,
  COLOR_PANEL_BG, MARKER_STROKE_WEIGHT, TOOLTIP_OFFSET_Y,
} from '../../utils/constants'

function cityColor(city: City, selectedIds: Set<string>): string {
  return selectedIds.has(city.id) ? COLOR_ORIGIN : COLOR_UNSELECTED
}

export default function FlightMap() {
  const {
    state,
    setLegOrigin,
    setLegDestination,
  } = useFlightContext()

  const selectedCityIds = new Set(
    state.legs.flatMap((leg) => [leg.origin?.id, leg.destination?.id].filter(Boolean)),
  )

  function handleCityClick(city: City) {
    const incompleteLeg = state.legs.find((leg) => !leg.origin || !leg.destination)
    if (!incompleteLeg) return

    if (!incompleteLeg.origin) {
      setLegOrigin(incompleteLeg.id, city)
      return
    }
    if (!incompleteLeg.destination) {
      setLegDestination(incompleteLeg.id, city)
    }
  }

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
        const isSelected = selectedCityIds.has(city.id)
        return (
          <CircleMarker
            key={city.id}
            center={[city.lat, city.lng]}
            radius={isSelected ? MARKER_RADIUS_SELECTED : MARKER_RADIUS_DEFAULT}
            pathOptions={{
              fillColor: cityColor(city, selectedCityIds),
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

      {state.legs.map((leg) =>
        leg.origin && leg.destination ? (
          <FlightArc
            key={leg.id}
            origin={leg.origin}
            destination={leg.destination}
            mode={leg.mode}
          />
        ) : null,
      )}
    </MapContainer>
  )
}
