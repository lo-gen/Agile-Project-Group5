import { useState } from "react";
import { CityDropdown } from "../components/Controls/CityDropdown";
import type { City, CabinClass } from "../types";
import { getFlightEmissions, getTypicalEmissions } from "../utils/timApi";
import { getApiEmissionsGrams } from "../utils/emissions";

const CABIN_CLASSES: { value: CabinClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

function parseFlightNumber(
  raw: string,
): { carrier: string; number: number } | null {
  const m = raw.trim().match(/^([A-Z0-9]{2,3})\s*(\d{1,4})$/i);
  if (!m) return null;
  return { carrier: m[1].toUpperCase(), number: parseInt(m[2], 10) };
}

interface LookupResult {
  flightCo2Kg: number | null;
  typicalCo2Kg: number;
  cabinClass: CabinClass;
}

function fmt(n: number) {
  return n.toLocaleString("en-GB", { maximumFractionDigits: 1 });
}

function Bar({
  label,
  co2Kg,
  color,
  maxBar,
}: {
  label: string;
  co2Kg: number;
  color: string;
  maxBar: number;
}) {
  const pct = maxBar > 0 ? (co2Kg / maxBar) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-eco-muted">
        <span>{label}</span>
        <span className="font-mono text-eco-text">{fmt(co2Kg)} kg</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden bg-eco-bg">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ResultSection({ result }: { result: LookupResult }) {
  const { flightCo2Kg, typicalCo2Kg } = result;
  const hasFlight = flightCo2Kg != null;
  const pctDiff = hasFlight
    ? ((flightCo2Kg! - typicalCo2Kg) / typicalCo2Kg) * 100
    : null;
  const maxBar = Math.max(flightCo2Kg ?? 0, typicalCo2Kg);

  return (
    <section className="rounded-xl border border-eco-border bg-eco-panel p-5 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-eco-muted">
        Emissions result
      </p>

      {!hasFlight && (
        <p className="text-xs text-amber-400 border border-amber-400/30 bg-amber-400/10 rounded px-2 py-1">
          Specific flight data unavailable — showing route average only
        </p>
      )}

      {hasFlight && pctDiff != null && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            pctDiff > 0
              ? "bg-red-500/10 border border-red-500/30 text-red-400"
              : "bg-eco-green/10 border border-eco-green/30 text-eco-green"
          }`}
        >
          This flight is{" "}
          <span className="font-bold">{Math.abs(pctDiff).toFixed(1)}%</span>{" "}
          {pctDiff > 0 ? "above" : "below"} the route average
        </div>
      )}

      <div className="space-y-3">
        {hasFlight && (
          <Bar label="This flight" co2Kg={flightCo2Kg!} color="#ef4444" maxBar={maxBar} />
        )}
        <Bar label="Route average" co2Kg={typicalCo2Kg} color="#22c55e" maxBar={maxBar} />
      </div>

      <div className="border-t border-eco-border pt-3 text-sm text-eco-muted space-y-1">
        {hasFlight && (
          <p>
            This flight:{" "}
            <span className="text-eco-text font-medium">
              {fmt(flightCo2Kg!)} kg CO₂
            </span>{" "}
            per person
          </p>
        )}
        <p>
          Route average:{" "}
          <span className="text-eco-text font-medium">
            {fmt(typicalCo2Kg)} kg CO₂
          </span>{" "}
          per person
        </p>
      </div>
    </section>
  );
}

export default function FlightLookupPage() {
  const [origin, setOrigin] = useState<City | null>(null);
  const [destination, setDestination] = useState<City | null>(null);
  const [flightNumber, setFlightNumber] = useState("");
  const [departureDate, setDepartureDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [cabinClass, setCabinClass] = useState<CabinClass>("economy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const canSubmit =
    origin && destination && flightNumber.trim() && departureDate;

  const handleLookup = async () => {
    if (!origin || !destination) return;
    const parsed = parseFlightNumber(flightNumber);
    if (!parsed) {
      setError('Invalid flight number. Use a format like "SK123" or "LH 456".');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const [year, month, day] = departureDate.split("-").map(Number);

    try {
      console.log(origin.iata, destination.iata, parsed.carrier, parsed.number);
      const [flightRes, typicalRes] = await Promise.allSettled([
        getFlightEmissions([
          {
            origin: origin.iata,
            destination: destination.iata,
            operatingCarrierCode: parsed.carrier,
            flightNumber: parsed.number,
            departureDate: { year, month, day },
          },
        ]),
        getTypicalEmissions(origin.iata, destination.iata),
      ]);

      let typicalGrams: number | null = null;
      if (typicalRes.status === "fulfilled") {
        const market = typicalRes.value.typicalFlightEmissions.find(
          (item) =>
            item.market.origin === origin.iata &&
            item.market.destination === destination.iata,
        );
        if (market) {
          typicalGrams = getApiEmissionsGrams(
            market.emissionsGramsPerPax,
            cabinClass,
          );
        }
      }

      let flightGrams: number | null = null;
      if (flightRes.status === "fulfilled") {
        const fe = flightRes.value.flightEmissions?.[0];
        if (fe?.emissionsGramsPerPax) {
          flightGrams = getApiEmissionsGrams(
            fe.emissionsGramsPerPax,
            cabinClass,
          );
          if (flightGrams === 0) flightGrams = null;
        }
      }

      if (typicalGrams == null && flightGrams == null) {
        setError(
          "No emissions data found for this route. Try a different origin or destination.",
        );
        return;
      }

      setResult({
        flightCo2Kg: flightGrams != null ? flightGrams / 1000 : null,
        typicalCo2Kg: (typicalGrams ?? flightGrams)! / 1000,
        cabinClass,
      });
    } catch {
      setError("Failed to fetch data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-eco-bg">
      <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-eco-green">
            EcoRoute
          </p>
          <h1 className="text-3xl font-semibold text-eco-text">
            Flight CO₂ Lookup
          </h1>
          <p className="mt-1 text-sm text-eco-muted">
            Enter a flight to see its carbon emissions and how it compares to
            the route average.
          </p>
        </header>

        <section className="rounded-xl border border-eco-border bg-eco-panel p-5 space-y-4">
          <CityDropdown
            label="From"
            value={origin}
            exclude={destination}
            onChange={setOrigin}
          />
          <CityDropdown
            label="To"
            value={destination}
            exclude={origin}
            onChange={setDestination}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-eco-muted uppercase tracking-wider">
              Flight number
            </label>
            <input
              type="text"
              placeholder="e.g. SK123 or LH 456"
              value={flightNumber}
              onChange={(e) => {
                setFlightNumber(e.target.value);
                setResult(null);
                setError(null);
              }}
              className="w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-sm text-eco-text focus:outline-none focus:ring-1 focus:ring-eco-green"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-eco-muted uppercase tracking-wider">
              Departure date
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => {
                setDepartureDate(e.target.value);
                setResult(null);
              }}
              className="w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-sm text-eco-text focus:outline-none focus:ring-1 focus:ring-eco-green"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-eco-muted uppercase tracking-wider">
              Cabin class
            </span>
            <div className="flex gap-2">
              {CABIN_CLASSES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setCabinClass(value);
                    setResult(null);
                  }}
                  className={[
                    "flex-1 py-2 text-sm rounded-md border transition-colors",
                    cabinClass === value
                      ? "bg-eco-green text-eco-bg border-eco-green font-semibold"
                      : "bg-transparent text-eco-muted border-eco-border hover:border-eco-green hover:text-eco-text",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleLookup()}
            disabled={!canSubmit || loading}
            className="w-full rounded-md bg-eco-green px-4 py-2.5 text-sm font-semibold text-eco-bg transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Looking up…" : "Look up emissions"}
          </button>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
              {error}
            </p>
          )}
        </section>

        {result && <ResultSection result={result} />}
      </div>
    </div>
  );
}
