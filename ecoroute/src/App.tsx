import { useEffect, useState } from 'react'
import CitySelector from './components/Controls/CitySelector'
import TravelClassSelector from './components/Controls/TravelClassSelector'
import EmissionsCard from './components/Results/EmissionsCard'
import ComparisonBar from './components/Results/ComparisonBar'
import FlightMap from './components/Map/FlightMap'
import AffiliateProgramPage from './pages/AffiliateProgramPage'
import AboutPage from './pages/AboutPage'

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

function getHashRoute(hash: string) {
  if (!hash || hash === '#/' || hash === '#') {
    return '/'
  }

  const route = hash.startsWith('#') ? hash.slice(1) : hash
  return route.startsWith('/') ? route : `/${route}`
}

export default function App() {
  const [route, setRoute] = useState(() => getHashRoute(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getHashRoute(window.location.hash))
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (route === '/affiliate') {
    return <AffiliateProgramPage />
  }

  if (route === '/about') {
    return <AboutPage />
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
              href="#/about"
              className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
            >
              About page
            </a>
            <a
              href="#/affiliate"
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
