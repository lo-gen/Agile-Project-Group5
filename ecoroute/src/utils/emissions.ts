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
  CAR_SPEED_KMH,
  TRAIN_SPEED_KMH,
  TREE_ABSORPTION_KG_PER_YEAR,
} from './constants'

/**
 * Estimates flight time based on distance.
 * Short distances fly slower, long haul cruises faster.
 */
function estimateFlightHours(distanceKm: number): number {
  if (distanceKm <= 0) return 0

  const minSpeed = 500
  const maxSpeed = 830
  const scale = 1200

  const effectiveSpeedKmh =
    maxSpeed - (maxSpeed - minSpeed) * Math.exp(-distanceKm / scale)

  return distanceKm / effectiveSpeedKmh
}

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
    durationHours: estimateFlightHours(distanceKm),
    co2Kg,
    co2KgPerKm,
    cabinClass,
    equivalentKmByCar:   co2Kg / CAR_EMISSION_PER_KM,
    equivalentKmByTrain: co2Kg / TRAIN_EMISSION_PER_KM,
    treesNeededToOffset: Math.ceil(co2Kg / TREE_ABSORPTION_KG_PER_YEAR),
  }
}

function calculateGroundEmissions(
  origin: City,
  destination: City,
  emissionPerKm: number,
  speedKmh: number,
): EmissionsResult {
  const distanceKm = haversineDistanceKm(origin, destination)
  const co2Kg = distanceKm * emissionPerKm

  return {
    distanceKm,
    durationHours: distanceKm / speedKmh,
    co2Kg,
    co2KgPerKm: emissionPerKm,
    cabinClass: 'economy',
    equivalentKmByCar:   co2Kg / CAR_EMISSION_PER_KM,
    equivalentKmByTrain: co2Kg / TRAIN_EMISSION_PER_KM,
    treesNeededToOffset: Math.ceil(co2Kg / TREE_ABSORPTION_KG_PER_YEAR),
  }
}

export function calculateCarEmissions(
  origin: City,
  destination: City,
): EmissionsResult {
  return calculateGroundEmissions(origin, destination, CAR_EMISSION_PER_KM, CAR_SPEED_KMH)
}

export function calculateTrainEmissions(
  origin: City,
  destination: City,
): EmissionsResult {
  return calculateGroundEmissions(origin, destination, TRAIN_EMISSION_PER_KM, TRAIN_SPEED_KMH)
}
