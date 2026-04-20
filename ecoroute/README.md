# EcoRoute

CO₂ emissions calculator for European flights. A student project addressing
UN Sustainable Development Goal 13 (Climate Action).

## How to run

```bash
cd ecoroute
npm install
npm run dev        # http://localhost:5173
npm test           # run unit tests
```

## CO₂ calculation methodology

EcoRoute uses the ICAO Carbon Emissions Calculator methodology:

1. **Great-circle distance** — calculated with the Haversine formula between
   airport coordinates.
2. **Detour factor** — 95 km added to account for non-direct routing.
3. **Emission factor** — based on haul type:
   - Short-haul (< 1 500 km): 0.255 kg CO₂ per km per passenger
   - Long-haul (≥ 1 500 km): 0.195 kg CO₂ per km per passenger
4. **Cabin class multiplier** — Economy 1.0×, Business 1.5×, First 2.0×
   (reflects floor-space and weight allocation).
5. **Radiative Forcing Index (RFI)** — multiplied by 2.7 to account for
   non-CO₂ warming effects of aviation at altitude (contrails, NOₓ, etc.).

All constants are in `src/utils/constants.ts`.

## How to add a new city

Open `src/data/cities.ts` and append a new object to the `cities` array:

```ts
{
  id:      'hkg',          // unique lowercase slug
  name:    'Hong Kong',
  country: 'China',
  iata:    'HKG',          // IATA airport code
  lat:     22.308901,
  lng:     113.914993,
}
```

No other files need to change.

## How to add a new transport mode (for future developers)

1. Add an entry to `src/data/transportModes.ts` with a `TransportMode` object.
2. Implement a calculation function in `src/utils/emissions.ts` — a stub
   (`calculateCarEmissions`, `calculateTrainEmissions`) already exists as a
   template. Return an `EmissionsResult`.
3. Wire the result into `FlightContext` (add a new action + reducer case).
4. Display the result in `ComparisonBar` — it already reads from `transportModes`.
