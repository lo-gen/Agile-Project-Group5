import { useRef, useEffect, useState } from "react";
import GlobeGL from "react-globe.gl";
import { cities } from "../../data/cities_clean";
import { useFlightContext } from "../../context/FlightContext";
import type { City } from "../../types";
import type { RouteSegment } from "../../routePlanner";
import {
  COLOR_ORIGIN,
  COLOR_DESTINATION,
  COLOR_UNSELECTED,
} from "../../utils/constants";

const COLOR_TRANSFER = "#f59e0b";
const COUNTRY_GEOJSON_URL =
  "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/country-boundaries/ne_110m_admin_0_countries.geojson";

interface CountryFeature {
  type: string;
  geometry: { type: string; coordinates: unknown[] };
  properties: {
    NAME: string;
    LABEL_X: number;
    LABEL_Y: number;
  };
}

interface Props {
  segments?: RouteSegment[] | null;
  showAirports: boolean;
  onToggleAirports: () => void;
}

function cityColor(
  city: City,
  origin: City | null,
  destination: City | null,
  transferIds: Set<string>,
): string {
  if (city.id === origin?.id) return COLOR_ORIGIN;
  if (city.id === destination?.id) return COLOR_DESTINATION;
  if (transferIds.has(city.id)) return COLOR_TRANSFER;
  return COLOR_UNSELECTED;
}

function pointRadius(
  city: City,
  origin: City | null,
  destination: City | null,
  altitude: number,
): number {
  const base =
    city.id === origin?.id || city.id === destination?.id ? 0.6 : 0.35;
  // Scale with altitude so points maintain a consistent screen size as the camera zooms
  return base * (altitude / DEFAULT_ALTITUDE);
}

const DEFAULT_ALTITUDE = 2.5;

export default function GlobeMap({
  segments,
  showAirports,
  onToggleAirports,
}: Props) {
  const { state, setOrigin, setDestination } = useFlightContext();
  const { origin, destination } = state;
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [cameraAltitude, setCameraAltitude] = useState(DEFAULT_ALTITUDE);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch(COUNTRY_GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => setCountries(data.features));
  }, []);

  useEffect(() => {
    // Globe takes a moment to initialise its OrbitControls after mount
    let controls: EventTarget | null = null;
    let handler: (() => void) | null = null;
    const timer = setTimeout(() => {
      const globe = globeRef.current;
      if (!globe) return;
      controls = globe.controls();
      if (!controls) return;
      handler = () => setCameraAltitude(globe.pointOfView().altitude);
      controls.addEventListener("change", handler);
    }, 200);
    return () => {
      clearTimeout(timer);
      if (controls && handler) controls.removeEventListener("change", handler);
    };
  }, []);

  function handleCityClick(city: City) {
    if (city.id === origin?.id) {
      setOrigin(null);
      return;
    }
    if (city.id === destination?.id) {
      setDestination(null);
      return;
    }
    if (!origin) setOrigin(city);
    else setDestination(city);
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

  const routePoints: City[] = [
    ...(origin ? [origin] : []),
    ...(destination ? [destination] : []),
    ...transferCities,
  ];

  const pointsData: City[] = [
    ...(showAirports ? cities.filter((c) => !routeAirportIds.has(c.id)) : []),
    ...routePoints,
  ];

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <GlobeGL
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="#4ade80"
        atmosphereAltitude={0.15}
        polygonsData={countries}
        polygonGeoJsonGeometry={(d) => (d as CountryFeature).geometry as never}
        polygonCapColor={() => "rgba(0,0,0,0)"}
        polygonSideColor={() => "rgba(0,0,0,0)"}
        polygonStrokeColor={() => "rgba(255,255,255,0.2)"}
        labelsData={countries}
        labelLat={(d) => (d as CountryFeature).properties.LABEL_Y}
        labelLng={(d) => (d as CountryFeature).properties.LABEL_X}
        labelText={(d) => (d as CountryFeature).properties.NAME}
        labelSize={0.45}
        labelDotRadius={0}
        labelColor={() => "rgba(255,255,255,0.6)"}
        labelResolution={2}
        labelAltitude={0.01}
        pointsData={pointsData}
        pointLat={(d) => (d as City).lat}
        pointLng={(d) => (d as City).lng}
        pointColor={(d) =>
          cityColor(
            d as City,
            origin,
            destination,
            new Set(transferCities.map((c) => c.id)),
          )
        }
        pointRadius={(d) =>
          pointRadius(d as City, origin, destination, cameraAltitude)
        }
        pointAltitude={0.01}
        pointLabel={(d) => {
          const c = d as City;
          const isTransfer = transferCities.some((t) => t.id === c.id);
          const tag =
            c.id === origin?.id
              ? "Origin"
              : c.id === destination?.id
                ? "Destination"
                : isTransfer
                  ? "Transfer"
                  : null;
          return `<div style="background:#0f1117cc;padding:4px 8px;border-radius:6px;color:#f1f5f9;font-size:12px;font-family:sans-serif;">
            ${tag ? `<span style="color:#22c55e;font-weight:600">${tag}: </span>` : ""}
            ${c.name} (${c.iata})
          </div>`;
        }}
        onPointClick={(point) => handleCityClick(point as City)}
        arcsData={segments ?? []}
        arcStartLat={(d) => (d as RouteSegment).from.lat}
        arcStartLng={(d) => (d as RouteSegment).from.lng}
        arcEndLat={(d) => (d as RouteSegment).to.lat}
        arcEndLng={(d) => (d as RouteSegment).to.lng}
        arcColor={(d) => (d as RouteSegment).color}
        arcAltitudeAutoScale={0.35}
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={(d) =>
          (d as RouteSegment).transportKind === "flight" ? 1500 : 0
        }
        arcStroke={() => 1.5 * (cameraAltitude / DEFAULT_ALTITUDE)}
        arcLabel={(d) => {
          const seg = d as RouteSegment;
          return `<div style="background:#0f1117cc;padding:6px 10px;border-radius:6px;color:#f1f5f9;font-size:12px;font-family:sans-serif;line-height:1.6;">
            <strong>${seg.icon} ${seg.transportLabel}</strong><br/>
            ${seg.from.name} → ${seg.to.name}<br/>
            ${seg.distanceKm.toFixed(0)} km · ${seg.co2Kg.toFixed(0)} kg CO₂
          </div>`;
        }}
      />

      <button
        type="button"
        onClick={onToggleAirports}
        className="absolute bottom-6 left-4 z-[1000] rounded-md border border-eco-border bg-eco-panel px-3 py-1.5 text-xs font-semibold text-eco-text shadow transition hover:border-eco-green hover:text-eco-green"
      >
        {showAirports ? "Hide airports" : "Show airports"}
      </button>
    </div>
  );
}
