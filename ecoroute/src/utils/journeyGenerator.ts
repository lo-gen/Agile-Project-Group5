import type { CabinClass, City, Journey, JourneyLeg, JourneyOption } from '../types'
import { calculateFlightEmissions, calculateCarEmissions, calculateTrainEmissions } from './emissions'
import { cities } from '../data/cities'
import { TREE_ABSORPTION_KG_PER_YEAR } from './constants'

function createSingleLegJourney(
  transportMode: 'flight' | 'car' | 'train',
  origin: City,
  destination: City,
  cabinClass: CabinClass,
): Journey {
  const emissions =
    transportMode === 'flight'
      ? calculateFlightEmissions(origin, destination, cabinClass)
      : transportMode === 'car'
        ? calculateCarEmissions(origin, destination)
        : calculateTrainEmissions(origin, destination)

  const leg: JourneyLeg = {
    transportMode,
    startCity: origin,
    endCity: destination,
    distanceKm: emissions.distanceKm,
    co2Kg: emissions.co2Kg,
    cabinClass: transportMode === 'flight' ? cabinClass : undefined,
  }

  return {
    id: `${transportMode}-${origin.id}-${destination.id}`,
    legs: [leg],
    totalDistanceKm: emissions.distanceKm,
    totalCo2Kg: emissions.co2Kg,
    treesNeededToOffset: Math.ceil(emissions.co2Kg / TREE_ABSORPTION_KG_PER_YEAR),
  }
}

function findIntermediateCity(startCity: City, endCity: City, allCities: City[]): City | null {
  const midpointLat = (startCity.lat + endCity.lat) / 2
  const midpointLng = (startCity.lng + endCity.lng) / 2

  let closestCity: City | null = null
  let closestDistance = Infinity

  for (const city of allCities) {
    if (city.id === startCity.id || city.id === endCity.id) continue

    const deltaLat = city.lat - midpointLat
    const deltaLng = city.lng - midpointLng
    const distance = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng)

    if (distance < closestDistance) {
      closestDistance = distance
      closestCity = city
    }
  }

  return closestCity
}

function createMultiLegJourney(
  firstMode: 'car' | 'train',
  secondMode: 'car' | 'train',
  origin: City,
  intermediate: City,
  destination: City,
): Journey {
  const firstEmissions = firstMode === 'car'
    ? calculateCarEmissions(origin, intermediate)
    : calculateTrainEmissions(origin, intermediate)

  const secondEmissions = secondMode === 'car'
    ? calculateCarEmissions(intermediate, destination)
    : calculateTrainEmissions(intermediate, destination)

  const legs: JourneyLeg[] = [
    {
      transportMode: firstMode,
      startCity: origin,
      endCity: intermediate,
      distanceKm: firstEmissions.distanceKm,
      co2Kg: firstEmissions.co2Kg,
    },
    {
      transportMode: secondMode,
      startCity: intermediate,
      endCity: destination,
      distanceKm: secondEmissions.distanceKm,
      co2Kg: secondEmissions.co2Kg,
    },
  ]

  const totalCo2Kg = legs.reduce((sum, leg) => sum + leg.co2Kg, 0)
  const totalDistanceKm = legs.reduce((sum, leg) => sum + leg.distanceKm, 0)

  return {
    id: `${firstMode}-${intermediate.id}-${secondMode}-${origin.id}-${destination.id}`,
    legs,
    totalDistanceKm,
    totalCo2Kg,
    treesNeededToOffset: Math.ceil(totalCo2Kg / TREE_ABSORPTION_KG_PER_YEAR),
  }
}

export function generateJourneyOptions(
  origin: City,
  destination: City,
  cabinClass: CabinClass,
): JourneyOption[] {
  const options: JourneyOption[] = []

  options.push({
    name: 'Direct Flight',
    description: `Fly directly from ${origin.name} to ${destination.name}`,
    journey: createSingleLegJourney('flight', origin, destination, cabinClass),
    rank: 0,
  })

  options.push({
    name: 'Drive',
    description: `Drive from ${origin.name} to ${destination.name}`,
    journey: createSingleLegJourney('car', origin, destination, cabinClass),
    rank: 0,
  })

  options.push({
    name: 'Train',
    description: `Take the train from ${origin.name} to ${destination.name}`,
    journey: createSingleLegJourney('train', origin, destination, cabinClass),
    rank: 0,
  })

  const intermediate = findIntermediateCity(origin, destination, cities)
  if (intermediate) {
    options.push({
      name: `Drive to ${intermediate.name} + Train`,
      description: `Drive to ${intermediate.name} then continue by train to ${destination.name}`,
      journey: createMultiLegJourney('car', 'train', origin, intermediate, destination),
      rank: 0,
    })

    options.push({
      name: `Train to ${intermediate.name} + Drive`,
      description: `Take the train to ${intermediate.name} then drive to ${destination.name}`,
      journey: createMultiLegJourney('train', 'car', origin, intermediate, destination),
      rank: 0,
    })
  }

  options.sort((a, b) => a.journey.totalCo2Kg - b.journey.totalCo2Kg)
  return options.map((option, index) => ({ ...option, rank: index + 1 }))
}
