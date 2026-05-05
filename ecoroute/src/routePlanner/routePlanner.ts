import { cities } from '../data/cities'
import type { City } from '../types'
import type {
  RouteOption,
  RoutePlanResult,
  RouteRequest,
  RouteSegment,
  RouteSegmentInput,
  RouteStrategy,
  RouteTransportCatalog,
  RouteTransportKind,
} from './types'
import { createDefaultRouteTransportCatalog } from './transport'

function makeRouteId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function roundDistance(distance: number) {
  return Math.round(distance * 10) / 10
}

function roundMinutes(minutes: number) {
  return Math.max(1, Math.round(minutes / 5) * 5)
}

function sumRouteSegments(segments: RouteSegment[]) {
  return segments.reduce(
    (totals, segment) => ({
      totalDistanceKm: totals.totalDistanceKm + segment.distanceKm,
      totalTravelTimeMinutes: totals.totalTravelTimeMinutes + segment.travelTimeMinutes,
      totalCo2Kg: totals.totalCo2Kg + segment.co2Kg,
    }),
    {
      totalDistanceKm: 0,
      totalTravelTimeMinutes: 0,
      totalCo2Kg: 0,
    },
  )
}

function midpoint(a: City, b: City) {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
  }
}

function pickClosestCity(reference: { lat: number; lng: number }, excluded: string[]) {
  const availableCities = cities.filter((city) => !excluded.includes(city.id))
  return (
    availableCities
      .map((city) => ({
        city,
        distance: Math.hypot(city.lat - reference.lat, city.lng - reference.lng),
      }))
      .sort((left, right) => left.distance - right.distance)[0]?.city ?? null
  )
}

function buildSegments(
  catalog: RouteTransportCatalog,
  steps: Array<{ transportKind: RouteTransportKind; from: City; to: City; cabinClass: RouteRequest['cabinClass'] }>,
): RouteSegment[] {
  return steps.flatMap((step) => {
    const transport = catalog.get(step.transportKind)
    if (!transport) {
      return []
    }

    return [transport.estimate({ from: step.from, to: step.to, cabinClass: step.cabinClass })]
  })
}

function createOption(
  strategy: RouteStrategy,
  label: string,
  description: string,
  segments: RouteSegment[],
): RouteOption {
  const totals = sumRouteSegments(segments)

  return {
    id: makeRouteId(strategy),
    strategy,
    label,
    description,
    segments,
    totalDistanceKm: roundDistance(totals.totalDistanceKm),
    totalTravelTimeMinutes: roundMinutes(totals.totalTravelTimeMinutes),
    totalCo2Kg: roundDistance(totals.totalCo2Kg),
    savingsVsDirectFlightKg: 0,
    isBest: false,
  }
}

function buildDirectFlightOption(request: RouteRequest, catalog: RouteTransportCatalog) {
  if (!request.origin || !request.destination) return null

  return createOption(
    'direct-flight',
    'Direct flight',
    'Fastest point-to-point air route for comparison.',
    buildSegments(catalog, [
      {
        transportKind: 'flight',
        from: request.origin,
        to: request.destination,
        cabinClass: request.cabinClass,
      },
    ]),
  )
}

function buildDriveOption(request: RouteRequest, catalog: RouteTransportCatalog) {
  if (!request.origin || !request.destination) return null

  return createOption(
    'drive',
    'Drive',
    'A single road segment for a direct car journey.',
    buildSegments(catalog, [
      {
        transportKind: 'car',
        from: request.origin,
        to: request.destination,
        cabinClass: request.cabinClass,
      },
    ]),
  )
}

function buildFullTrainOption(request: RouteRequest, catalog: RouteTransportCatalog) {
  if (!request.origin || !request.destination) return null

  const firstHub = pickClosestCity(midpoint(request.origin, request.destination), [request.origin.id, request.destination.id])
  const secondHub = pickClosestCity(
    midpoint(firstHub ?? request.origin, request.destination),
    [request.origin.id, request.destination.id, firstHub?.id ?? ''],
  )

  if (!firstHub || !secondHub) return null

  return createOption(
    'full-train',
    'Full train journey',
    'Rail-first route with two transfer points to compare against flight.',
    buildSegments(catalog, [
      {
        transportKind: 'train',
        from: request.origin,
        to: firstHub,
        cabinClass: request.cabinClass,
      },
      {
        transportKind: 'train',
        from: firstHub,
        to: secondHub,
        cabinClass: request.cabinClass,
      },
      {
        transportKind: 'train',
        from: secondHub,
        to: request.destination,
        cabinClass: request.cabinClass,
      },
    ]),
  )
}

function buildMultiModalOption(request: RouteRequest, catalog: RouteTransportCatalog) {
  if (!request.origin || !request.destination) return null

  const railHub = pickClosestCity(request.origin, [request.origin.id, request.destination.id])
  const airHub = pickClosestCity(midpoint(request.origin, request.destination), [request.origin.id, request.destination.id, railHub?.id ?? ''])

  if (!railHub || !airHub) return null

  return createOption(
    'multi-modal',
    'Multi-modal route',
    'A mixed route with rail and air to show a realistic planning flow.',
    buildSegments(catalog, [
      {
        transportKind: 'train',
        from: request.origin,
        to: railHub,
        cabinClass: request.cabinClass,
      },
      {
        transportKind: 'flight',
        from: railHub,
        to: airHub,
        cabinClass: request.cabinClass,
      },
      {
        transportKind: 'train',
        from: airHub,
        to: request.destination,
        cabinClass: request.cabinClass,
      },
    ]),
  )
}

function cloneSegments(segments: RouteSegment[]) {
  return segments.map((segment) => ({ ...segment }))
}

function summarizeOptions(options: RouteOption[]) {
  const directFlight = options.find((option) => option.strategy === 'direct-flight')
  const bestOption = options.reduce<RouteOption | null>((best, current) => {
    if (!best) return current
    return current.totalCo2Kg < best.totalCo2Kg ? current : best
  }, null)

  const directFlightCo2Kg = directFlight?.totalCo2Kg ?? 0
  const bestOptionId = bestOption?.id ?? ''

  return {
    directFlightCo2Kg,
    bestOptionId,
    options: options.map((option) => ({
      ...option,
      savingsVsDirectFlightKg: roundDistance(directFlightCo2Kg - option.totalCo2Kg),
      isBest: option.id === bestOptionId,
    })),
  }
}

export class RoutePlannerService {
  private readonly catalog: RouteTransportCatalog

  constructor(catalog: RouteTransportCatalog) {
    this.catalog = catalog
  }

  listTransports() {
    return this.catalog.list()
  }

  estimateSegment(kind: RouteTransportKind, input: RouteSegmentInput) {
    const transport = this.catalog.get(kind)
    if (!transport) return null
    return transport.estimate(input)
  }

  splitSegment(segment: RouteSegment) {
    const midpointCity = pickClosestCity(
      midpoint(segment.from, segment.to),
      [segment.from.id, segment.to.id],
    )

    if (!midpointCity) return [segment]

    const first = this.estimateSegment(segment.transportKind, {
      from: segment.from,
      to: midpointCity,
      cabinClass: segment.cabinClass ?? 'economy',
    })

    const second = this.estimateSegment(segment.transportKind, {
      from: midpointCity,
      to: segment.to,
      cabinClass: segment.cabinClass ?? 'economy',
    })

    if (!first || !second) return [segment]
    return [first, second]
  }

  recalculateRoute(option: RouteOption, directFlightCo2Kg: number) {
    const totals = sumRouteSegments(option.segments)

    return {
      ...option,
      totalDistanceKm: roundDistance(totals.totalDistanceKm),
      totalTravelTimeMinutes: roundMinutes(totals.totalTravelTimeMinutes),
      totalCo2Kg: roundDistance(totals.totalCo2Kg),
      savingsVsDirectFlightKg: roundDistance(directFlightCo2Kg - totals.totalCo2Kg),
    }
  }

  buildOptions(request: RouteRequest): RoutePlanResult {
    if (!request.origin || !request.destination) {
      return {
        options: [],
        bestOptionId: '',
        directFlightCo2Kg: 0,
        message: 'Choose both a starting location and a destination before planning.',
      }
    }

    if (request.origin.id === request.destination.id) {
      return {
        options: [],
        bestOptionId: '',
        directFlightCo2Kg: 0,
        message: 'Starting location and destination must be different.',
      }
    }

    const baseOptions = [
      buildDirectFlightOption(request, this.catalog),
      buildDriveOption(request, this.catalog),
      buildFullTrainOption(request, this.catalog),
      buildMultiModalOption(request, this.catalog),
    ].filter((option): option is RouteOption => Boolean(option))

    const summarized = summarizeOptions(baseOptions)

    return {
      options: summarized.options,
      bestOptionId: summarized.bestOptionId,
      directFlightCo2Kg: summarized.directFlightCo2Kg,
      message: 'Journey options generated successfully.',
    }
  }

  cloneOption(option: RouteOption) {
    return {
      ...option,
      segments: cloneSegments(option.segments),
    }
  }
}

export function createDefaultRoutePlanner() {
  return new RoutePlannerService(createDefaultRouteTransportCatalog())
}
