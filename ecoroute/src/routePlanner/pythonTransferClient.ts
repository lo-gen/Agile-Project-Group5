interface TransferMatchResponse {
  route?: unknown
}

export async function fetchPythonTransferRoute(
  startIata: string,
  endIata: string,
): Promise<string[] | null> {
  const start = startIata.trim().toUpperCase()
  const end = endIata.trim().toUpperCase()
  if (start.length !== 3 || end.length !== 3) return null

  try {
    const response = await fetch(
      `/api/transfer-match?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
    )
    if (!response.ok) return null

    const body = (await response.json()) as TransferMatchResponse
    if (!Array.isArray(body.route)) return null

    const normalized = body.route
      .map((value) => (typeof value === 'string' ? value.trim().toUpperCase() : ''))
      .filter((value) => value.length === 3)

    return normalized.length > 1 ? normalized : null
  } catch {
    return null
  }
}

