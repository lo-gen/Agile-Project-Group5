import flightRouteAdjacency from '../data/flightRouteAdjacency'

type Adjacency = Record<string, string[]>

// Mirrors transfer_match.py BFS behavior to find a flight path with transfers.
export function findTransferRoute(
  start: string,
  end: string,
  adjacency: Adjacency = flightRouteAdjacency,
): string[] | null {
  const normalizedStart = start.trim().toUpperCase()
  const normalizedEnd = end.trim().toUpperCase()

  if (!normalizedStart || !normalizedEnd) return null

  const queue: string[][] = [[normalizedStart]]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const route = queue.shift()!
    const currentAirport = route[route.length - 1]

    if (currentAirport === normalizedEnd) {
      return route
    }

    if (visited.has(currentAirport)) {
      continue
    }

    visited.add(currentAirport)

    const possibleRoutes = adjacency[currentAirport] ?? []
    for (const nextAirport of possibleRoutes) {
      if (!visited.has(nextAirport)) {
        queue.push([...route, nextAirport])
      }
    }
  }

  return null
}

