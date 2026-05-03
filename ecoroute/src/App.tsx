import { useEffect, useState } from 'react'
import RoutePlannerDashboard from './pages/RoutePlannerDashboard'
import AffiliateProgramPage from './pages/AffiliateProgramPage'
import AboutPage from './pages/AboutPage'

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

  return <RoutePlannerDashboard />
}
