# EcoRoute — Design Spec

**Date:** 2026-04-20  
**Project:** EcoRoute — CO2 emissions calculator for flight travel  
**Context:** Student project, UN SDG 13 (Climate Action)  
**Status:** Approved

---

## Overview

A client-side React + TypeScript web application that calculates CO2 emissions for flights between European cities. No backend. All logic runs in the browser.

The app has a split layout: a left control/results panel (35%) and a full-height interactive Leaflet map (65%). Users select an origin and destination (via dropdowns or by clicking map markers), choose a cabin class, and see CO2 emissions with context (car/train equivalents, trees needed to offset).

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 18 + Vite |
| Language | TypeScript (strict mode) |
| Map | React-Leaflet + OpenStreetMap tiles |
| Styling | Tailwind CSS |
| Fonts | DM Sans (UI) + DM Mono (data values) via Google Fonts |
| State | React Context + useReducer |
| Backend | None — fully client-side |

---

## File Structure

```
ecoroute/                          ← lives at /Agile-Project-Group5/ecoroute/
├── public/
├── src/
│   ├── components/
│   │   ├── Map/
│   │   │   ├── FlightMap.tsx      # Leaflet map, city markers, click logic
│   │   │   └── FlightArc.tsx      # Animated great-circle arc + plane icon
│   │   ├── Controls/
│   │   │   ├── CitySelector.tsx   # From/To dropdowns
│   │   │   └── TravelClassSelector.tsx  # Economy/Business/First toggle
│   │   └── Results/
│   │       ├── EmissionsCard.tsx  # Main CO2 result display
│   │       └── ComparisonBar.tsx  # Flight vs car vs train bar chart
│   ├── context/
│   │   └── FlightContext.tsx      # Context + useReducer (NOT inline in App)
│   ├── data/
│   │   ├── cities.ts              # 20 European cities
│   │   └── transportModes.ts      # TransportMode definitions (flight/car/train)
│   ├── utils/
│   │   ├── constants.ts           # All named numeric constants
│   │   ├── distance.ts            # Haversine formula
│   │   └── emissions.ts           # CO2 calculation + placeholder stubs
│   ├── types/
│   │   └── index.ts               # ALL shared TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html                     # Google Fonts import here
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## TypeScript Interfaces (all in `src/types/index.ts`)

```ts
interface City {
  id: string;
  name: string;
  country: string;
  iata: string;
  lat: number;
  lng: number;
}

type CabinClass = "economy" | "business" | "first";

interface EmissionsResult {
  distanceKm: number;
  co2Kg: number;
  co2KgPerKm: number;
  cabinClass: CabinClass;
  equivalentKmByCar: number;
  equivalentKmByTrain: number;
  treesNeededToOffset: number;
}

interface FlightState {
  origin: City | null;
  destination: City | null;
  cabinClass: CabinClass;
  result: EmissionsResult | null;
}

type FlightAction =
  | { type: "SET_ORIGIN"; payload: City | null }
  | { type: "SET_DESTINATION"; payload: City | null }
  | { type: "SET_CABIN_CLASS"; payload: CabinClass }
  | { type: "RESET" };

interface TransportMode {
  id: string;
  label: string;
  emissionPerKm: number;  // kg CO2 per km
  color: string;           // Tailwind or hex color for ComparisonBar
}
```

No inline type definitions anywhere else. No `any` types.

---

## Constants (`src/utils/constants.ts`)

```ts
export const EMISSION_FACTOR_SHORT_HAUL = 0.255;   // kg CO2/km, < 1500 km
export const EMISSION_FACTOR_LONG_HAUL  = 0.195;   // kg CO2/km, >= 1500 km
export const SHORT_HAUL_THRESHOLD_KM    = 1500;
export const RFI_MULTIPLIER             = 2.7;
export const DETOUR_FACTOR_KM           = 95;
export const CAR_EMISSION_PER_KM        = 0.21;
export const TRAIN_EMISSION_PER_KM      = 0.041;
export const TREE_ABSORPTION_KG_PER_YEAR = 21;

export const CABIN_CLASS_MULTIPLIERS = {
  economy:  1.0,
  business: 1.5,
  first:    2.0,
} as const;
```

---

## CO2 Calculation (`src/utils/emissions.ts`)

**Methodology:** ICAO Carbon Emissions Calculator

Pipeline for `calculateFlightEmissions(origin, destination, cabinClass)`:

1. `haversineDistanceKm(origin, destination)` + `DETOUR_FACTOR_KM`
2. Select emission factor: `distance < SHORT_HAUL_THRESHOLD_KM ? SHORT_HAUL : LONG_HAUL`
3. `rawCo2 = adjustedDistance × emissionFactor × CABIN_CLASS_MULTIPLIERS[cabinClass]`
4. `co2Kg = rawCo2 × RFI_MULTIPLIER`
5. Derive:
   - `equivalentKmByCar = co2Kg / CAR_EMISSION_PER_KM`
   - `equivalentKmByTrain = co2Kg / TRAIN_EMISSION_PER_KM`
   - `treesNeededToOffset = Math.ceil(co2Kg / TREE_ABSORPTION_KG_PER_YEAR)`

Also exports (typed, not implemented — for future developers):
- `calculateCarEmissions(origin, destination): EmissionsResult`
- `calculateTrainEmissions(origin, destination): EmissionsResult`

All exported functions have JSDoc comments.

---

## State Management (`src/context/FlightContext.tsx`)

`useReducer` with `FlightState`. The reducer calls `calculateFlightEmissions` whenever both `origin` and `destination` are non-null after `SET_ORIGIN`, `SET_DESTINATION`, or `SET_CABIN_CLASS` — `result` is always derived inline, never stale.

`RESET` returns to initial state: `{ origin: null, destination: null, cabinClass: "economy", result: null }`.

Context exposes `state` and `dispatch`. No selectors needed for MVP.

---

## Map (`FlightMap.tsx` + `FlightArc.tsx`)

**FlightMap.tsx:**
- `MapContainer` centered at `{ lat: 54, lng: 15 }`, zoom 4
- OpenStreetMap tile layer
- One `CircleMarker` per city from `cities.ts`
  - Unselected: small gray, radius 5
  - Origin: green (`#22c55e`), radius 7
  - Destination: red (`#ef4444`), radius 7
- Click logic: first unselected city click → `SET_ORIGIN`; second → `SET_DESTINATION`; clicking an already-selected city → dispatch `SET_ORIGIN`/`SET_DESTINATION` with `null` to deselect
- Renders `<FlightArc />` when both origin and destination are non-null

**FlightArc.tsx:**
- Computes 50 great-circle intermediate points via linear interpolation of lat/lng (sufficient approximation for European distances)
- Renders a `Polyline` with those points
- `useEffect` on mount: grabs SVG `<path>` element, reads `getTotalLength()`, applies `strokeDasharray` and `strokeDashoffset` = total length, then uses CSS transition to animate `strokeDashoffset` to `0` over 1.5 s
- A `Marker` with a ✈ `DivIcon` sits at the 25th point (midpoint), appears after 750 ms delay
- Unmounts and remounts (replaying animation) whenever origin or destination changes — handled by a React `key` prop combining `origin.id + destination.id`

---

## UI Layout

Full-viewport `flex flex-row`. No scroll on the outer container.

**Left panel** (`w-[35%] h-screen overflow-y-auto`):
1. Header: "EcoRoute" + leaf icon + subtitle
2. `CitySelector`: From / To `<select>` dropdowns, populated from `cities.ts`, synced with map state
3. `TravelClassSelector`: three buttons, active state highlighted green
4. `EmissionsCard`: hidden when `result === null`; large DM Mono CO2 value, distance, car equivalent, trees to offset
5. `ComparisonBar`: three horizontal bars (flight/car/train), widths proportional to CO2 kg, color-coded

**Right panel** (`w-[65%] h-screen`): `FlightMap` fills 100%.

---

## Styling

| Token | Value |
|-------|-------|
| Background | `#0f1117` |
| Panel bg | `#1a1d27` |
| Accent green | `#22c55e` |
| Accent red | `#ef4444` |
| Text primary | `#f1f5f9` |
| Text muted | `#94a3b8` |
| Border | `#2d3748` |

Fonts added to `index.html`: DM Sans (300–600) and DM Mono (400–500).  
Tailwind config extends theme with these custom colors and font families.

Tone: clean, data-focused, dark, serious — environmental data, not a booking site.

---

## Data Files

**`src/data/cities.ts`** — 20 cities (Stockholm, Copenhagen, Oslo, Helsinki, London, Amsterdam, Brussels, Paris, Berlin, Munich, Warsaw, Vienna, Prague, Zurich, Madrid, Barcelona, Lisbon, Rome, Milan, Athens). Adding a new city = appending one object. No other changes needed.

**`src/data/transportModes.ts`** — Three `TransportMode` objects: flight, car, train. Used by `ComparisonBar`. Ready for future route calculators.

---

## Code Quality Constraints

- All components: max 100 lines. Split further if needed.
- No `any` types anywhere.
- All utility functions: pure, no side effects.
- All exported utils: JSDoc comments.
- No hardcoded numbers — always reference `constants.ts`.
- Responsive for 1280px+ desktop only (no mobile requirement for MVP).
- `FlightContext.tsx` separate from `App.tsx` to keep both under 100 lines.

---

## Extensibility

- **New cities:** append to `cities.ts` array — no other changes.
- **New transport modes:** add to `transportModes.ts`, implement calculation function in `emissions.ts` (stubs already exported).
- **Non-European cities:** `cities.ts` has no geographic constraint — just add objects.
- **Mobile support:** Tailwind breakpoint classes can be layered in without restructuring.

---

## Deliverables

1. All source files created and fully functional
2. `npm install` + `npm run dev` starts without errors
3. `README.md` covering: how to run, CO2 methodology, how to add cities, how to add transport modes
