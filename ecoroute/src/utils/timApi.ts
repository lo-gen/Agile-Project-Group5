import type { FlightRequest, TIMResponse, TypicalEmissionsResponse } from '../types/tim';

const API_KEY = import.meta.env.VITE_TIM_API_KEY;

const BASE_URL = 'https://travelimpactmodel.googleapis.com/v1/flights';

export async function getFlightEmissions(
    flights: FlightRequest[]
): Promise<TIMResponse> {
    const res = await fetch(
        `${BASE_URL}:computeFlightEmissions?key=${API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flights }),
        }
    );

    if (!res.ok) throw new Error(`TIM API error: ${res.status}`);
    return res.json();
}

export async function getTypicalEmissions(
  origin: string,
  destination: string
): Promise<TypicalEmissionsResponse> {
  const res = await fetch(
    `${BASE_URL}:computeTypicalFlightEmissions?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markets: [{ origin, destination }] }),
    }
  );

  if (!res.ok) throw new Error(`TIM API error: ${res.status}`);
  return res.json();
}

export const gramsToKg = (grams?: number): string =>
  grams != null ? (grams / 1000).toFixed(1) : 'N/A';