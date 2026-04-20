import type { City, CabinClass, EmissionsResult } from '../types'
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
): EmissionsResult {
  const rawDistance = haversineDistanceKm(origin, destination)
  const distanceKm  = rawDistance + DETOUR_FACTOR_KM

  const emissionFactor =
    distanceKm < SHORT_HAUL_THRESHOLD_KM
      ? EMISSION_FACTOR_SHORT_HAUL
      : EMISSION_FACTOR_LONG_HAUL

  const cabinMultiplier = CABIN_CLASS_MULTIPLIERS[cabinClass]
  const co2Kg = distanceKm * emissionFactor * cabinMultiplier * RFI_MULTIPLIER
  const co2KgPerKm = co2Kg / distanceKm

  return {
    distanceKm,
    co2Kg,
    co2KgPerKm,
    cabinClass,
    equivalentKmByCar:   co2Kg / CAR_EMISSION_PER_KM,
    equivalentKmByTrain: co2Kg / TRAIN_EMISSION_PER_KM,
    treesNeededToOffset: Math.ceil(co2Kg / TREE_ABSORPTION_KG_PER_YEAR),
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
