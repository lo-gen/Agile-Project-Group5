import { describe, expect, it, vi, afterEach } from "vitest";
import { getTypicalEmissions, getFlightEmissions, gramsToKg } from "../timApi";

const sampleMarkets = [
  { origin: "ARN", destination: "GOT" },
  { origin: "BOS", destination: "NAN" },
];

describe("getTypicalEmissions", () => {
  const apiKey = import.meta.env.VITE_TIM_API_KEY?.trim();

  (apiKey ? it : it.skip)(
    "calls the real TIM API for a known market pair",
    async () => {
      for (const market of sampleMarkets) {
        const response = await getTypicalEmissions(
          market.origin,
          market.destination,
        );

        expect(response.typicalFlightEmissions.length).toBeGreaterThan(0);

        for (const result of response.typicalFlightEmissions) {
          expect(result.market).toEqual(market);
          console.log(result);
          expect(result.emissionsGramsPerPax).toMatchObject({
            first: expect.any(Number),
            business: expect.any(Number),
            premiumEconomy: expect.any(Number),
            economy: expect.any(Number),
          });
        }
      }
    },
    30000,
  );
});

const sampleFlights = [
  {
    origin: "ARN",
    destination: "GOT",
    operatingCarrierCode: "SK",
    flightNumber: 161,
    departureDate: { year: 2026, month: 5, day: 18 },
  },
];

describe("getFlightEmissions", () => {
  const apiKey = import.meta.env.VITE_TIM_API_KEY?.trim();

  (apiKey ? it : it.skip)(
    "calls the real TIM API for a known flight number",
    async () => {
      for (const flight of sampleFlights) {
        const response = await getFlightEmissions([flight]);

        expect(response.flightEmissions.length).toBeGreaterThan(0);

        for (const result of response.flightEmissions) {
          expect(result.flight).toMatchObject({
            origin: flight.origin,
            destination: flight.destination,
            operatingCarrierCode: flight.operatingCarrierCode,
            flightNumber: flight.flightNumber,
          });
          console.log(result);
          expect(result.emissionsGramsPerPax).toBeDefined();
          const pax = result.emissionsGramsPerPax;
          for (const cabin of [
            "economy",
            "premiumEconomy",
            "business",
            "first",
          ] as const) {
            if (pax[cabin] !== undefined) {
              expect(typeof pax[cabin]).toBe("number");
              expect(pax[cabin]).toBeGreaterThan(0);
            }
          }
          expect([
            "CONTRAILS_IMPACT_UNSPECIFIED",
            "CONTRAILS_IMPACT_NEGLIGIBLE",
            "CONTRAILS_IMPACT_MODERATE",
            "CONTRAILS_IMPACT_SEVERE",
          ]).toContain(result.contrailsImpactBucket);
        }
      }
    },
    30000,
  );
});

describe("gramsToKg", () => {
  it("converts grams to kg formatted to one decimal place", () => {
    expect(gramsToKg(1500)).toBe("1.5");
    expect(gramsToKg(50000)).toBe("50.0");
  });

  it("returns 'N/A' when value is undefined", () => {
    expect(gramsToKg(undefined)).toBe("N/A");
  });

  it("returns '0.0' for zero grams", () => {
    expect(gramsToKg(0)).toBe("0.0");
  });
});

describe("getFlightEmissions error handling", () => {
  afterEach(() => vi.restoreAllMocks());

  it("throws when the API returns a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 403 }),
    );
    await expect(getFlightEmissions([sampleFlights[0]])).rejects.toThrow(
      "TIM API error: 403",
    );
  });
});

describe("getTypicalEmissions error handling", () => {
  afterEach(() => vi.restoreAllMocks());

  it("throws when the API returns a non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    await expect(getTypicalEmissions("ARN", "GOT")).rejects.toThrow(
      "TIM API error: 500",
    );
  });
});
