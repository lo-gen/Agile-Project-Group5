import { haversineDistanceKm } from '../utils/distance'
import {
  CABIN_CLASS_MULTIPLIERS,
  DETOUR_FACTOR_KM,
  RFI_MULTIPLIER,
  SHORT_HAUL_THRESHOLD_KM,
} from '../utils/constants'
import type { City } from '../types'
import type {
  RouteSegment,
  RouteSegmentInput,
  RouteTransport,
  RouteTransportCatalog,
  RouteTransportKind,
} from './types'

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function roundDistance(distance: number) {
  return Math.round(distance * 10) / 10
}

function roundMinutes(minutes: number) {
  return Math.max(1, Math.round(minutes / 5) * 5)
}

abstract class BaseTransport implements RouteTransport {
  public readonly id: RouteTransportKind
  public readonly label: string
  public readonly icon: string
  public readonly color: string

  constructor(id: RouteTransportKind, label: string, icon: string, color: string) {
    this.id = id
    this.label = label
    this.icon = icon
    this.color = color
  }

  estimate(input: RouteSegmentInput): RouteSegment {
    const distanceKm = roundDistance(this.calculateDistanceKm(input.from, input.to))
    const travelTimeMinutes = roundMinutes((distanceKm / this.getSpeedKmh(input)) * 60)
    const co2Kg = roundDistance(distanceKm * this.getEmissionPerKm(input))

    return {
      id: makeId(this.id),
      transportKind: this.id,
      transportLabel: this.label,
      icon: this.icon,
      color: this.color,
      from: input.from,
      to: input.to,
      distanceKm,
      travelTimeMinutes,
      co2Kg,
      cabinClass: input.cabinClass,
      path: [
        [input.from.lat, input.from.lng],
        [input.to.lat, input.to.lng],
      ],
    }
  }

  protected calculateDistanceKm(from: City, to: City) {
    return haversineDistanceKm(from, to) + this.getDetourKm(from, to)
  }

  protected getDetourKm(_from: City, _to: City) {
    return 0
  }

  protected abstract getSpeedKmh(input: RouteSegmentInput): number
  protected abstract getEmissionPerKm(input: RouteSegmentInput): number
}

class FlightTransport extends BaseTransport {
  constructor() {
    super('flight', 'Flight', '✈️', '#ef4444')
  }

  protected override getDetourKm() {
    return DETOUR_FACTOR_KM
  }

  protected override getSpeedKmh() {
    return 820
  }

  protected override getEmissionPerKm(input: RouteSegmentInput) {
    const distanceKm = haversineDistanceKm(input.from, input.to) + DETOUR_FACTOR_KM
    const haulFactor = distanceKm < SHORT_HAUL_THRESHOLD_KM ? 0.255 : 0.195
    return haulFactor * CABIN_CLASS_MULTIPLIERS[input.cabinClass] * RFI_MULTIPLIER
  }
}

class TrainTransport extends BaseTransport {
  constructor() {
    super('train', 'Train', '🚆', '#22c55e')
  }

  protected override getSpeedKmh() {
    return 220
  }

  protected override getEmissionPerKm() {
    return 0.041
  }
}

class BusTransport extends BaseTransport {
  constructor() {
    super('bus', 'Bus', '🚌', '#38bdf8')
  }

  protected override getSpeedKmh() {
    return 70
  }

  protected override getEmissionPerKm() {
    return 0.09
  }
}

class CarTransport extends BaseTransport {
  constructor() {
    super('car', 'Car', '🚗', '#f97316')
  }

  protected override getSpeedKmh() {
    return 95
  }

  protected override getEmissionPerKm() {
    return 0.21
  }
}

class FerryTransport extends BaseTransport {
  constructor() {
    super('ferry', 'Ferry', '⛴️', '#14b8a6')
  }

  protected override getSpeedKmh() {
    return 45
  }

  protected override getEmissionPerKm() {
    return 0.115
  }
}

class WalkingTransport extends BaseTransport {
  constructor() {
    super('walking', 'Walking', '🚶', '#94a3b8')
  }

  protected override getSpeedKmh() {
    return 5
  }

  protected override getEmissionPerKm() {
    return 0
  }
}

export class InMemoryRouteTransportCatalog implements RouteTransportCatalog {
  private readonly transports: RouteTransport[]

  constructor(transports: RouteTransport[]) {
    this.transports = transports
  }

  list() {
    return [...this.transports]
  }

  get(id: string) {
    const normalized = id.trim().toLowerCase()
    return this.transports.find((transport) => transport.id === normalized) ?? null
  }
}

export function createDefaultRouteTransportCatalog() {
  return new InMemoryRouteTransportCatalog([
    new FlightTransport(),
    new TrainTransport(),
    new BusTransport(),
    new CarTransport(),
    new FerryTransport(),
    new WalkingTransport(),
  ])
}
