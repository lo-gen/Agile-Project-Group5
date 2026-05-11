import { useAuth } from '../context/AuthContext'
import { useFlightHistory } from '../hooks/useFlightHistory'
import { supabase } from '../lib/supabase'

export default function AccountPage() {
  const { user } = useAuth()
  const { flightHistory, isLoading, reloadHistory } = useFlightHistory()

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-eco-muted">Du måste vara inloggad för att se din historik.</p>
      </div>
    )
  }

  const handleDelete = async (id: string) => {
    await supabase.from('flights').delete().eq('id', id)
    await reloadHistory()
  }

  const handleClearAll = async () => {
    if (!confirm('Är du säker på att du vill ta bort all historik?')) return
    await supabase.from('flights').delete().eq('user_id', user.id)
    await reloadHistory()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-eco-green">Konto</p>
        <h1 className="text-3xl font-semibold text-eco-text">Min historik</h1>
        <p className="mt-1 text-sm text-eco-muted">{user.email}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-eco-muted">Laddar historik…</p>
      ) : !flightHistory || flightHistory.length === 0 ? (
        <div className="rounded-xl border border-eco-border bg-eco-panel p-8 text-center">
          <p className="text-eco-muted">Ingen historik ännu.</p>
          <p className="mt-1 text-xs text-eco-muted">
            Planera en resa på startsidan så sparas den här automatiskt.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-eco-muted">{flightHistory.length} sparade resor</p>
            <button
              onClick={() => void handleClearAll()}
              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
            >
              Rensa allt
            </button>
          </div>

          <div className="divide-y divide-eco-border rounded-xl border border-eco-border bg-eco-panel overflow-hidden">
            {flightHistory.map((flight) => {
              const date = new Date(flight.created_at).toLocaleDateString('sv-SE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
              return (
                <div key={flight.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-eco-text">
                      {flight.origin_city} → {flight.destination_city}
                    </p>
                    <p className="mt-0.5 text-xs text-eco-muted">
                      {flight.cabin_class} · {Math.round(flight.emissions_kg)} kg CO₂ · {Math.round(flight.distance_km).toLocaleString('sv-SE')} km · {date}
                    </p>
                  </div>
                  <button
                    onClick={() => void handleDelete(flight.id)}
                    className="ml-4 text-eco-muted transition hover:text-red-500"
                    aria-label="Ta bort"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
