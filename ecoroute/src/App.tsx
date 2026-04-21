import CitySelector from './components/Controls/CitySelector'
import TravelClassSelector from './components/Controls/TravelClassSelector'
import EmissionsCard from './components/Results/EmissionsCard'
import ComparisonBar from './components/Results/ComparisonBar'
import FlightMap from './components/Map/FlightMap'
import AffiliateProgramPage from './pages/AffiliateProgramPage'

function BrandIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-eco-green text-xs font-bold text-eco-bg"
    >
      ER
    </span>
  )
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

export default function App() {
  const pathname = normalizePathname(window.location.pathname)

  if (pathname === '/affiliate') {
    return <AffiliateProgramPage />
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-eco-bg font-sans">
      <aside className="flex h-full w-[35%] flex-col gap-4 overflow-y-auto border-r border-eco-border bg-eco-panel p-5">
        <header>
          <div className="flex items-center justify-between gap-3">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-eco-text">
              <BrandIcon />
              EcoRoute
            </h1>

            <a
              href="/affiliate"
              className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
            >
              Join affiliate
            </a>
          </div>
          <p className="mt-2 text-sm text-eco-muted">Calculate your flight emissions</p>
        </header>

        <hr className="border-eco-border" />

        <CitySelector />
        <TravelClassSelector />

        <EmissionsCard />
        <ComparisonBar />
      </aside>

      <main className="h-full w-[65%]">
        <FlightMap />
      </main>
    </div>
  )
}
