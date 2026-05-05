// ecoroute/src/components/History/FlightHistorySidebar.tsx
import type { SavedFlight } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { useFlightHistory } from '../../hooks/useFlightHistory'
import { useFlightContext } from '../../hooks/useFlightContext'
import { supabase } from '../../lib/supabase'
import FlightHistoryItem from './FlightHistoryItem'

export default function FlightHistorySidebar() {
  const { user } = useAuth()
  const { flightHistory, reloadHistory } = useFlightHistory()
  const { setOrigin, setDestination, setCabinClass, clearHistory } = useFlightContext()

  if (!user) return null

  const handleFlightClick = async (flight: SavedFlight) => {
    if (!flight) return
    // Find cities in data to get full city data
    // For now, just set the name - coordinates will be looked up if needed
    setOrigin({ id: '', name: flight.origin_city, country: '', iata: '', lat: 0, lng: 0 })
    setDestination({ id: '', name: flight.destination_city, country: '', iata: '', lat: 0, lng: 0 })
    setCabinClass(flight.cabin_class)
  }

  const handleDeleteFlight = async (id: string) => {
    try {
      await supabase.from('flights').delete().eq('id', id)
      await reloadHistory()
    } catch (err) {
      console.error('Failed to delete flight:', err)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all your flight history?')) return
    try {
      await supabase.from('flights').delete().eq('user_id', user.id)
      clearHistory()
      await reloadHistory()
    } catch (err) {
      console.error('Failed to clear history:', err)
    }
  }

  if (!flightHistory || flightHistory.length === 0) {
    return (
      <div className="mt-4 rounded-md border border-eco-border p-4 text-center text-sm text-eco-muted">
        <p>No flights saved yet</p>
        <p className="mt-1 text-xs">Search for a flight to add to your history</p>
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-eco-text">
          Your Flight History ({flightHistory.length})
        </h3>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {flightHistory.map((flight) => (
          <FlightHistoryItem
            key={flight.id}
            flight={flight}
            onClick={() => handleFlightClick(flight)}
            onDelete={() => handleDeleteFlight(flight.id)}
          />
        ))}
      </div>
      <button
        onClick={handleClearAll}
        className="w-full rounded-md border border-red-300 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
      >
        Clear All History
      </button>
    </div>
  )
}
