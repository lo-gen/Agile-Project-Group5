import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { FlightProvider } from './context/FlightContext'
import { AuthProvider } from './context/AuthContext'
import { JourneyProvider } from './context/JourneyContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FlightProvider>
        <JourneyProvider>
          <App />
        </JourneyProvider>
      </FlightProvider>
    </AuthProvider>
  </StrictMode>,
)
