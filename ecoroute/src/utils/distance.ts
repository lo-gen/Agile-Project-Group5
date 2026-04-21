import { EARTH_RADIUS_KM } from './constants'

/** Coordinate pair for distance calculation. */
interface Coord {
  lat: number;
  lng: number;
}

/**
 * Calculates the great-circle distance between two coordinates
 * using the Haversine formula.
 *
 * @param a - Origin coordinate
 * @param b - Destination coordinate
 * @returns Distance in kilometres
 */
export function haversineDistanceKm(a: Coord, b: Coord): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)

  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)

  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}
