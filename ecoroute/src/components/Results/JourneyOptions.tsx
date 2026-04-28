import { useState } from 'react'
import type { JourneyOption } from '../../types'
import { useJourneyContext } from '../../context/JourneyContext'

interface JourneyOptionsProps {
  options: JourneyOption[]
}

function getRankBadge(rank: number): string {
  if (rank === 1) return 'bg-eco-green text-eco-bg'
  if (rank === 2) return 'bg-yellow-500 text-eco-bg'
  if (rank === 3) return 'bg-orange-500 text-eco-bg'
  return 'bg-eco-muted text-eco-text'
}

function getRankLabel(rank: number): string {
  if (rank === 1) return 'Best'
  if (rank === 2) return 'Good'
  if (rank === 3) return 'Fair'
  return `#${rank}`
}

export default function JourneyOptions({ options }: JourneyOptionsProps) {
  const { selectJourney } = useJourneyContext()
  const [showAll, setShowAll] = useState(false)

  if (!options || options.length === 0) {
    return (
      <div className="rounded-2xl border border-eco-border bg-eco-panel p-4 text-sm text-eco-muted">
        Pick a departure city and a destination to compare journey options.
      </div>
    )
  }

  const topThree = options.slice(0, 3)
  const remaining = options.slice(3)
  const visibleOptions = showAll ? options : topThree

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-eco-text">Travel By</h2>
        </div>
      </div>

      <div className="grid gap-4">
        {visibleOptions.map((option) => (
          <button
            key={option.journey.id}
            type="button"
            onClick={() => selectJourney(option.journey)}
            className="group w-full rounded-3xl border border-eco-border bg-eco-bg/80 p-4 text-left transition hover:bg-eco-panel focus:border-eco-green active:translate-y-0.5"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-eco-text">{option.name}</h3>
                  <p className="mt-1 text-sm text-eco-muted">{option.description}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRankBadge(option.rank)}`}>
                  {getRankLabel(option.rank)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {remaining.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="rounded-2xl border border-eco-border bg-eco-bg/50 px-4 py-3 text-sm font-medium text-eco-text transition hover:bg-eco-panel focus:border-eco-green"
        >
          {showAll ? '▲ Hide other options' : `▼ Show ${remaining.length} more option${remaining.length !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  )
}
