import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
} from "react-leaflet";
import { cities } from "../../data/cities_clean";
import { useFlightContext } from "../../context/FlightContext";
import { useLanguage } from "../../context/LanguageContext";
import type { City } from "../../types";
import type { RouteSegment } from "../../routePlanner";
import {
  MAP_CENTER_LAT,
  MAP_CENTER_LNG,
  MAP_DEFAULT_ZOOM,
  MARKER_RADIUS_DEFAULT,
  MARKER_RADIUS_SELECTED,
  COLOR_ORIGIN,
  COLOR_DESTINATION,
  COLOR_UNSELECTED,
  COLOR_PANEL_BG,
  MARKER_STROKE_WEIGHT,
  TOOLTIP_OFFSET_Y,
} from "../../utils/constants";

const COLOR_TRANSFER = "#f59e0b";

interface Props {
  segments?: RouteSegment[] | null;
}

function cityColor(
  city: City,
  origin: City | null,
  destination: City | null,
): string {
  if (city.id === origin?.id) return COLOR_ORIGIN;
  if (city.id === destination?.id) return COLOR_DESTINATION;
  return COLOR_UNSELECTED;
}

export default function FlightMap({ segments }: Props) {
  const { state, setOrigin, setDestination } = useFlightContext();
  const { t } = useLanguage();
  const { origin, destination } = state;
  const [showAirports, setShowAirports] = useState(false);

  function handleCityClick(city: City) {
    if (city.id === origin?.id) {
      setOrigin(null);
      return;
    }
    if (city.id === destination?.id) {
      setDestination(null);
      return;
    }
    if (!origin) {
      setOrigin(city);
    } else {
      setDestination(city);
    }
  }

  const transferCities: City[] =
    segments && segments.length > 1
      ? segments.slice(0, -1).map((seg) => seg.to)
      : [];

  const routeAirportIds = new Set(
    [origin?.id, destination?.id, ...transferCities.map((c) => c.id)].filter(
      Boolean,
    ),
  );

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[MAP_CENTER_LAT, MAP_CENTER_LNG]}
        zoom={MAP_DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {showAirports &&
          cities
            .filter((city) => !routeAirportIds.has(city.id))
            .map((city) => (
              <CircleMarker
                key={city.id}
                center={[city.lat, city.lng]}
                radius={MARKER_RADIUS_DEFAULT}
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
            ))}

        {transferCities.map((city) => (
          <CircleMarker
            key={`transfer-${city.id}`}
            center={[city.lat, city.lng]}
            radius={MARKER_RADIUS_SELECTED}
            pathOptions={{
              fillColor: COLOR_TRANSFER,
              fillOpacity: 1,
              color: COLOR_PANEL_BG,
              weight: MARKER_STROKE_WEIGHT,
            }}
          >
            <Tooltip direction="top" offset={[0, TOOLTIP_OFFSET_Y]}>
              {t('mapTransferLabel')} {city.name} ({city.iata})
            </Tooltip>
          </CircleMarker>
        ))}

        {origin && (
          <CircleMarker
            key={`route-${origin.id}`}
            center={[origin.lat, origin.lng]}
            radius={MARKER_RADIUS_SELECTED}
            pathOptions={{
              fillColor: COLOR_ORIGIN,
              fillOpacity: 1,
              color: COLOR_PANEL_BG,
              weight: MARKER_STROKE_WEIGHT,
            }}
            eventHandlers={{ click: () => handleCityClick(origin) }}
          >
            <Tooltip direction="top" offset={[0, TOOLTIP_OFFSET_Y]}>
              {origin.name} ({origin.iata})
            </Tooltip>
          </CircleMarker>
        )}

        {destination && (
          <CircleMarker
            key={`route-${destination.id}`}
            center={[destination.lat, destination.lng]}
            radius={MARKER_RADIUS_SELECTED}
            pathOptions={{
              fillColor: COLOR_DESTINATION,
              fillOpacity: 1,
              color: COLOR_PANEL_BG,
              weight: MARKER_STROKE_WEIGHT,
            }}
            eventHandlers={{ click: () => handleCityClick(destination) }}
          >
            <Tooltip direction="top" offset={[0, TOOLTIP_OFFSET_Y]}>
              {destination.name} ({destination.iata})
            </Tooltip>
          </CircleMarker>
        )}

        {segments?.map((segment) => (
          <Polyline
            key={segment.id}
            positions={
              segment.path ?? [
                [segment.from.lat, segment.from.lng],
                [segment.to.lat, segment.to.lng],
              ]
            }
            pathOptions={{
              color: segment.color,
              weight: 3,
              opacity: 0.9,
              dashArray:
                segment.transportKind === "flight" ? "10 8" : undefined,
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
                  {segment.distanceKm.toFixed(0)} km ·{" "}
                  {segment.co2Kg.toFixed(0)} kg CO₂
                </div>
              </div>
            </Tooltip>
          </Polyline>
        ))}
      </MapContainer>

      <button
        type="button"
        onClick={() => setShowAirports((v) => !v)}
        className="absolute bottom-6 left-4 z-[1000] rounded-md border border-eco-border bg-eco-panel px-3 py-1.5 text-xs font-semibold text-eco-text shadow transition hover:border-eco-green hover:text-eco-green"
      >
        {showAirports ? t('mapHideAirports') : t('mapShowAirports')}
      </button>
    </div>
  );
}
