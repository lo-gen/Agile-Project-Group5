import { useEffect, useState } from 'react'
import RoutePlannerDashboard from './pages/RoutePlannerDashboard'
import AffiliateProgramPage from './pages/AffiliateProgramPage'
import AboutPage from './pages/AboutPage'
import AuthButton from './components/Auth/AuthButton'
import LoginModal from './components/Auth/LoginModal'

function getHashRoute(hash: string) {
  if (!hash || hash === '#/' || hash === '#') {
    return '/'
  }

  const route = hash.startsWith('#') ? hash.slice(1) : hash
  return route.startsWith('/') ? route : `/${route}`
}

export default function App() {
  const [route, setRoute] = useState(() => getHashRoute(window.location.hash))
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getHashRoute(window.location.hash))
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const page = route === '/affiliate' ? (
    <AffiliateProgramPage />
  ) : route === '/about' ? (
    <AboutPage />
  ) : (
    <RoutePlannerDashboard />
  )

  return (
    <div className="min-h-screen bg-eco-bg text-eco-text">
      <header className="sticky top-0 z-50 border-b border-eco-border bg-eco-panel/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#/" className="text-sm font-semibold uppercase tracking-[0.25em] text-eco-green">
            EcoRoute
          </a>

          <nav className="flex flex-wrap items-center gap-2">
            <a
              href="#/"
              className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium transition hover:border-eco-green hover:text-eco-green"
            >
              Home
            </a>
            <a
              href="#/about"
              className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium transition hover:border-eco-green hover:text-eco-green"
            >
              About Us
            </a>
            <a
              href="#/affiliate"
              className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium transition hover:border-eco-green hover:text-eco-green"
            >
              Affiliate Marketing
            </a>
          </nav>

          <AuthButton onLoginClick={() => setIsLoginOpen(true)} />
        </div>
      </header>

      <main>{page}</main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  )
}
