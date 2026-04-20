import CitySelector         from './components/Controls/CitySelector'
import TravelClassSelector  from './components/Controls/TravelClassSelector'
import EmissionsCard        from './components/Results/EmissionsCard'
import ComparisonBar        from './components/Results/ComparisonBar'
import FlightMap            from './components/Map/FlightMap'

function LeafIcon() {
  return <span aria-hidden="true">🌿</span>
}

export default function App() {
  return (
    <div className="flex h-screen w-screen bg-eco-bg font-sans overflow-hidden">
      {/* Left panel */}
      <aside className="w-[35%] h-full flex flex-col gap-4 p-5 bg-eco-panel border-r border-eco-border overflow-y-auto">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-semibold text-eco-text flex items-center gap-2">
            <LeafIcon /> EcoRoute
          </h1>
          <p className="text-sm text-eco-muted mt-1">Calculate your flight emissions</p>
        </header>

        <hr className="border-eco-border" />

        <CitySelector />
        <TravelClassSelector />

        <EmissionsCard />
        <ComparisonBar />
      </aside>

      {/* Right panel — map */}
      <main className="w-[65%] h-full">
        <FlightMap />
      </main>
    </div>
  )
}
