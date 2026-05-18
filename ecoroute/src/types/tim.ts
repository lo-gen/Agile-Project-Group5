export interface FlightRequest {
    origin: string;
    destination: string;
    operatingCarrierCode: string;
    flightNumber: number;
    departureDate: {
        year: number;
        month: number;
        day: number;
    };
}

export interface EmissionsPerPax {
    economy?: number;
    premiumEconomy?: number;
    business?: number;
    first?: number;
}

export type ContrailsBucket =
    | 'CONTRAILS_IMPACT_UNSPECIFIED'
    | 'CONTRAILS_IMPACT_NEGLIGIBLE'
    | 'CONTRAILS_IMPACT_MODERATE'
    | 'CONTRAILS_IMPACT_SEVERE';

export interface FlightEmissionResult {
    flight: FlightRequest;
    emissionsGramsPerPax: EmissionsPerPax;
    source: string;
    contrailsImpactBucket: ContrailsBucket;
}

export interface TIMResponse {
    flightEmissions: FlightEmissionResult[];
    modelVersion: {
        major: number;
        minor: number;
        patch: number;
        dated: string;
    };
}

export interface TypicalEmissionsResponse {
    typicalFlightEmissions: {
        market: { origin: string; destination: string };
        emissionsGramsPerPax: EmissionsPerPax;
    }[];
}