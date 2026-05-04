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