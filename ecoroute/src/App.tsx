import { useEffect, useState } from 'react'
import CitySelector from './components/Controls/CitySelector'
import TravelClassSelector from './components/Controls/TravelClassSelector'
import JourneyOptions from './components/Results/JourneyOptions'
import EmissionsCard from './components/Results/EmissionsCard'
import ComparisonBar from './components/Results/ComparisonBar'
import FlightMap from './components/Map/FlightMap'
import AffiliateProgramPage from './pages/AffiliateProgramPage'
import AboutPage from './pages/AboutPage'
import AuthButton from './components/Auth/AuthButton'
import LoginModal from './components/Auth/LoginModal'
import FlightHistorySidebar from './components/History/FlightHistorySidebar'
import { useJourneyContext } from './context/JourneyContext'

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
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { state: journeyState } = useJourneyContext()

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

            <div className="flex items-center gap-2">
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
              <AuthButton onLoginClick={() => setLoginModalOpen(true)} />
            </div>
          </div>
          <p className="mt-2 text-sm text-eco-muted">
            {journeyState.journeyOptions ? 'Choose the lowest-carbon route for your trip' : 'Calculate your journey emissions and compare modes'}
          </p>
        </header>

        <hr className="border-eco-border" />

        <CitySelector />
        <TravelClassSelector />

        <div className="rounded-2xl border border-eco-border bg-eco-panel p-4">
          <JourneyOptions
            options={journeyState.journeyOptions ?? []}
          />
        </div>

        <EmissionsCard />
        <ComparisonBar />

        <FlightHistorySidebar />
      </aside>

      <main className="h-full w-[65%]">
        <FlightMap />
      </main>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  )
}
