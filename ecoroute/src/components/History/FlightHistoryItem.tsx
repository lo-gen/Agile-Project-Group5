// ecoroute/src/components/History/FlightHistoryItem.tsx
import type { SavedFlight } from '../../types'

interface FlightHistoryItemProps {
  flight: SavedFlight
  onClick: () => void
  onDelete: () => void
}

export default function FlightHistoryItem({
  flight,
  onClick,
  onDelete,
}: FlightHistoryItemProps) {
  const date = new Date(flight.created_at).toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center justify-between rounded-md border border-eco-border p-3 transition hover:bg-eco-bg hover:border-eco-green"
    >
      <div className="flex-1 text-xs">
        <div className="font-medium text-eco-text">
          {flight.origin_city} → {flight.destination_city}
        </div>
        <div className="text-eco-muted">
          {flight.cabin_class} • {date}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="ml-2 text-eco-muted transition hover:text-red-500"
        aria-label="Delete"
      >
        ✕
      </button>
    </div>
  )
}
