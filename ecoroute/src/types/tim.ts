export interface FlightRrequest {
    origin: string;
    destination: string;
    operationCarrietCode: string;
    flightNumber: Number;
    departureDate: {
        year: number;
        month: number;
        day: number;
    };
}

export interface EmissionsPerPax {
    first?: number;
    buisseness?: number;
    permiumEconomy?: number;
    economy?: number;
}

export type ContrailsBucket =
    | 'CONTRAILS_IMPACT_UNSPECIFIED'
    | 'CONTRAILS_IMPACT_LOW'
    | 'CONTRAILS_IMPACT_MODERATE'
    | 'CONTRAILS_IMPACT_HIGH';

export interface FlightEmissionResult {
    flight: FlightRrequest;
    emissionGramsPerPax: EmissionsPerPax;
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