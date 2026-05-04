import type { City, CabinClass, EmissionsResult } from '../types'
import type { EmissionsPerPax } from '../types/tim'
import { haversineDistanceKm } from './distance'
import {
  DETOUR_FACTOR_KM,
  SHORT_HAUL_THRESHOLD_KM,
  EMISSION_FACTOR_SHORT_HAUL,
  EMISSION_FACTOR_LONG_HAUL,
  CABIN_CLASS_MULTIPLIERS,
  RFI_MULTIPLIER,
  CAR_EMISSION_PER_KM,
  TRAIN_EMISSION_PER_KM,
  TREE_ABSORPTION_KG_PER_YEAR,
} from './constants'

/**
 * Calculates CO2 emissions for a flight between two cities.
 *
 * Methodology: ICAO Carbon Emissions Calculator approach.
 * 1. Great-circle distance (Haversine) + 95 km detour factor
 * 2. Emission factor by haul type (short < 1500 km, long ≥ 1500 km)
 * 3. Cabin class multiplier (economy 1×, business 1.5×, first 2×)
 * 4. Radiative Forcing Index of 2.7 for non-CO2 altitude effects
 *
 * @param origin - Departure city
 * @param destination - Arrival city
 * @param cabinClass - Passenger cabin class
 * @returns Detailed emissions result with equivalents
 */
export function calculateFlightEmissions(
  origin: City,
  destination: City,
  cabinClass: CabinClass,
  groupSize = 1,
): EmissionsResult {
  const rawDistance = haversineDistanceKm(origin, destination)
  const distanceKm  = rawDistance + DETOUR_FACTOR_KM

  const emissionFactor =
    distanceKm < SHORT_HAUL_THRESHOLD_KM
      ? EMISSION_FACTOR_SHORT_HAUL
      : EMISSION_FACTOR_LONG_HAUL

  const cabinMultiplier = CABIN_CLASS_MULTIPLIERS[cabinClass]
  const safeGroupSize = Math.max(1, Math.floor(groupSize))

  const perPersonCo2Kg = distanceKm * emissionFactor * cabinMultiplier * RFI_MULTIPLIER
  const totalCo2Kg = perPersonCo2Kg * safeGroupSize
  const co2KgPerKm = perPersonCo2Kg / distanceKm



 return {
  distanceKm,
  co2Kg: totalCo2Kg, // keep existing UI working
  co2KgPerKm,
  cabinClass,
  groupSize: safeGroupSize,
  perPersonCo2Kg,
  totalCo2Kg,
  equivalentKmByCar: totalCo2Kg / CAR_EMISSION_PER_KM,
  equivalentKmByTrain: totalCo2Kg / TRAIN_EMISSION_PER_KM,
  treesNeededToOffset: Math.ceil(totalCo2Kg / TREE_ABSORPTION_KG_PER_YEAR),
}

}

export function getApiEmissionsGrams(
  emissions: EmissionsPerPax,
  cabinClass: CabinClass,
): number {
  switch (cabinClass) {
    case 'business':
      return emissions.business ?? emissions.economy ?? 0
    case 'first':
      return emissions.first ?? emissions.business ?? emissions.economy ?? 0
    default:
      return emissions.economy ?? 0
  }
}

export function buildFlightEmissionsResultFromApi(
  origin: City,
  destination: City,
  cabinClass: CabinClass,
  groupSize = 1,
  gramsPerPax: number,
): EmissionsResult {
  const rawDistance = haversineDistanceKm(origin, destination)
  const distanceKm = rawDistance + DETOUR_FACTOR_KM
  const safeGroupSize = Math.max(1, Math.floor(groupSize))

  const perPersonCo2Kg = gramsPerPax / 1000
  const totalCo2Kg = perPersonCo2Kg * safeGroupSize
  const co2KgPerKm = distanceKm > 0 ? perPersonCo2Kg / distanceKm : 0

  return {
    distanceKm,
    co2Kg: totalCo2Kg,
    co2KgPerKm,
    cabinClass,
    groupSize: safeGroupSize,
    perPersonCo2Kg,
    totalCo2Kg,
    equivalentKmByCar: totalCo2Kg / CAR_EMISSION_PER_KM,
    equivalentKmByTrain: totalCo2Kg / TRAIN_EMISSION_PER_KM,
    treesNeededToOffset: Math.ceil(totalCo2Kg / TREE_ABSORPTION_KG_PER_YEAR),
  }
}

/**
 * Placeholder for future car emissions calculation.
 * @param _origin - Departure city
 * @param _destination - Arrival city
 */
export function calculateCarEmissions(
  _origin: City,
  _destination: City,
): EmissionsResult {
  throw new Error('calculateCarEmissions is not yet implemented')
}

/**
 * Placeholder for future train emissions calculation.
 * @param _origin - Departure city
 * @param _destination - Arrival city
 */
export function calculateTrainEmissions(
  _origin: City,
  _destination: City,
): EmissionsResult {
  throw new Error('calculateTrainEmissions is not yet implemented')
}
