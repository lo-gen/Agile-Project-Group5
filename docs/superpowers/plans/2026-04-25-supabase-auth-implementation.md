# Supabase Authentication & Flight History Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Supabase authentication with email/password, login modal in top-right corner, and persistent flight history for logged-in users.

**Architecture:** AuthContext manages Supabase session + user state. FlightContext extended to save/load flight history. LoginModal is a portal component. FlightHistorySidebar appears only when logged in. All async operations wrapped in suspense/loading states.

**Tech Stack:** Supabase JS SDK (`@supabase/supabase-js`), React Context, TypeScript, Tailwind CSS.

---

## File Structure

**Files to create:**
- `ecoroute/src/lib/supabase.ts` – Supabase client singleton
- `ecoroute/src/context/AuthContext.tsx` – Auth state management
- `ecoroute/src/hooks/useFlightHistory.ts` – Custom hook for fetching flight history
- `ecoroute/src/components/Auth/LoginModal.tsx` – Login/signup modal
- `ecoroute/src/components/Auth/AuthButton.tsx` – Header auth button (login/logout)
- `ecoroute/src/components/History/FlightHistorySidebar.tsx` – Display saved flights
- `ecoroute/src/components/History/FlightHistoryItem.tsx` – Single flight in history

**Files to modify:**
- `ecoroute/package.json` – Add `@supabase/supabase-js`
- `ecoroute/src/types/index.ts` – Add Auth, FlightHistory types
- `ecoroute/src/context/FlightContext.tsx` – Add flight history state + save function
- `ecoroute/src/App.tsx` – Add AuthProvider, LoginModal state, integrate sidebar
- `ecoroute/src/main.tsx` – Wrap app with AuthProvider
- `ecoroute/src/components/Results/EmissionsCard.tsx` – Hook into save flight to history

---

### Task 1: Install Supabase SDK

**Files:**
- Modify: `ecoroute/package.json`

- [ ] **Step 1: Add dependency**

```bash
cd ecoroute && npm install @supabase/supabase-js
```

- [ ] **Step 2: Verify installation**

```bash
npm ls @supabase/supabase-js
```

Expected output shows `@supabase/supabase-js@^1.x.x`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @supabase/supabase-js dependency"
```

---

### Task 2: Create Supabase Client

**Files:**
- Create: `ecoroute/src/lib/supabase.ts`

- [ ] **Step 1: Create client singleton**

```typescript
// ecoroute/src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jronzqrkrzltinoixent.supabase.co'
const SUPABASE_KEY = 'sb_publishable_tUuv96iMRPyQFMwCySoKhg_Dr4nS0UM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
```

- [ ] **Step 2: Commit**

```bash
git add ecoroute/src/lib/supabase.ts
git commit -m "feat: initialize Supabase client"
```

---

### Task 3: Extend Types

**Files:**
- Modify: `ecoroute/src/types/index.ts`

- [ ] **Step 1: Read current types file and understand structure**

- [ ] **Step 2: Add auth and flight history types to end of file**

```typescript
// Auth types
export interface AuthUser {
  id: string
  email: string
}

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// Flight history types
export interface SavedFlight {
  id: string
  origin_city: string
  destination_city: string
  cabin_class: CabinClass
  emissions_kg: number
  distance_km: number
  created_at: string
}

export interface FlightHistoryContextValue {
  flightHistory: SavedFlight[] | null
  isLoadingHistory: boolean
  saveFlightToHistory: (flight: Omit<SavedFlight, 'id' | 'created_at'>) => Promise<void>
  deleteFlightFromHistory: (id: string) => Promise<void>
  clearFlightHistory: () => Promise<void>
  reloadHistory: () => Promise<void>
}
```

- [ ] **Step 3: Commit**

```bash
git add ecoroute/src/types/index.ts
git commit -m "feat: add auth and flight history types"
```

---

### Task 4: Create AuthContext

**Files:**
- Create: `ecoroute/src/context/AuthContext.tsx`

- [ ] **Step 1: Create AuthContext and AuthProvider**

```typescript
// ecoroute/src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser, AuthContextValue } from '../types'
import { supabase } from '../lib/supabase'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize session from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          })
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string) => {
    setError(null)
    setIsLoading(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (signUpError) throw signUpError
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      setUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 2: Commit**

```bash
git add ecoroute/src/context/AuthContext.tsx
git commit -m "feat: create AuthContext with login/signup/logout"
```

---

### Task 5: Create AuthButton Component

**Files:**
- Create: `ecoroute/src/components/Auth/AuthButton.tsx`

- [ ] **Step 1: Create AuthButton**

```typescript
// ecoroute/src/components/Auth/AuthButton.tsx
import { useAuth } from '../../context/AuthContext'

interface AuthButtonProps {
  onLoginClick: () => void
}

export default function AuthButton({ onLoginClick }: AuthButtonProps) {
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <button disabled className="px-3 py-1.5 text-xs font-medium text-eco-muted">
        Loading...
      </button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-eco-muted">{user.email}</span>
        <button
          onClick={logout}
          className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
        >
          Log Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={onLoginClick}
      className="rounded-md border border-eco-border px-3 py-1.5 text-xs font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
    >
      Log In
    </button>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add ecoroute/src/components/Auth/AuthButton.tsx
git commit -m "feat: create AuthButton component with login/logout UI"
```

---

### Task 6: Create LoginModal Component

**Files:**
- Create: `ecoroute/src/components/Auth/LoginModal.tsx`

- [ ] **Step 1: Create LoginModal**

```typescript
// ecoroute/src/components/Auth/LoginModal.tsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, signup } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setIsSubmitting(true)

    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await signup(email, password)
      }
      onClose()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm rounded-lg bg-eco-panel p-6 shadow-lg">
        <div className="mb-6 flex gap-2 border-b border-eco-border">
          <button
            onClick={() => {
              setTab('login')
              setLocalError(null)
            }}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === 'login'
                ? 'border-b-2 border-eco-green text-eco-green'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setTab('signup')
              setLocalError(null)
            }}
            className={`px-4 py-2 text-sm font-medium transition ${
              tab === 'signup'
                ? 'border-b-2 border-eco-green text-eco-green'
                : 'text-eco-muted hover:text-eco-text'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-eco-text">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-eco-text placeholder-eco-muted focus:border-eco-green focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-eco-text">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-eco-text placeholder-eco-muted focus:border-eco-green focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {localError && (
            <div className="rounded-md bg-red-100 p-3 text-sm text-red-700">{localError}</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-eco-green px-4 py-2 text-sm font-medium text-eco-bg transition hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? 'Loading...' : tab === 'login' ? 'Log In' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-eco-border px-4 py-2 text-sm font-medium text-eco-text transition hover:border-eco-green hover:text-eco-green"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add ecoroute/src/components/Auth/LoginModal.tsx
git commit -m "feat: create LoginModal with login and signup tabs"
```

---

### Task 7: Create useFlightHistory Hook

**Files:**
- Create: `ecoroute/src/hooks/useFlightHistory.ts`

- [ ] **Step 1: Create hook**

```typescript
// ecoroute/src/hooks/useFlightHistory.ts
import { useEffect, useState } from 'react'
import type { SavedFlight } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useFlightHistory() {
  const { user } = useAuth()
  const [flightHistory, setFlightHistory] = useState<SavedFlight[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = async () => {
    if (!user) {
      setFlightHistory(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('flights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setFlightHistory(data as SavedFlight[])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load history'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [user?.id])

  return {
    flightHistory,
    isLoading,
    error,
    reloadHistory: loadHistory,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add ecoroute/src/hooks/useFlightHistory.ts
git commit -m "feat: create useFlightHistory hook to fetch user flights"
```

---

### Task 8: Extend FlightContext with Flight History

**Files:**
- Modify: `ecoroute/src/context/FlightContext.tsx`

- [ ] **Step 1: Read current file and understand structure**

- [ ] **Step 2: Add imports at top**

```typescript
import type { SavedFlight } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
```

- [ ] **Step 3: Update FlightState interface - add to end of interface**

```typescript
flightHistory: SavedFlight[] | null
isLoadingHistory: boolean
```

- [ ] **Step 4: Update initialState**

```typescript
const initialState: FlightState = {
  origin:           null,
  destination:      null,
  cabinClass:       'economy',
  result:           null,
  flightHistory:    null,
  isLoadingHistory: false,
}
```

- [ ] **Step 5: Add new action types to FlightAction union**

```typescript
| { type: 'SET_FLIGHT_HISTORY'; payload: SavedFlight[] }
| { type: 'SET_LOADING_HISTORY'; payload: boolean }
| { type: 'ADD_TO_HISTORY'; payload: SavedFlight }
| { type: 'REMOVE_FROM_HISTORY'; payload: string }
| { type: 'CLEAR_HISTORY' }
```

- [ ] **Step 6: Update reducer switch statement - add these cases**

```typescript
case 'SET_FLIGHT_HISTORY':
  return { ...state, flightHistory: action.payload }
case 'SET_LOADING_HISTORY':
  return { ...state, isLoadingHistory: action.payload }
case 'ADD_TO_HISTORY': {
  const current = state.flightHistory || []
  return { ...state, flightHistory: [action.payload, ...current] }
}
case 'REMOVE_FROM_HISTORY': {
  const filtered = state.flightHistory?.filter((f) => f.id !== action.payload) ?? null
  return { ...state, flightHistory: filtered && filtered.length > 0 ? filtered : null }
}
case 'CLEAR_HISTORY':
  return { ...state, flightHistory: null }
```

- [ ] **Step 7: Update FlightContextValue interface - add these methods**

```typescript
setFlightHistory: (flights: SavedFlight[]) => void
addToHistory: (flight: SavedFlight) => void
removeFromHistory: (id: string) => void
clearHistory: () => void
saveFlightToHistory: (originCity: string, destCity: string, cabinClass: CabinClass, emissionsKg: number, distanceKm: number) => Promise<void>
```

- [ ] **Step 8: Update FlightProvider - replace entire provider value object**

Inside FlightProvider component, after const [state, dispatch] line, add:

```typescript
const { user } = useAuth()

const saveFlightToHistory = async (
  originCity: string,
  destCity: string,
  cabinClass: CabinClass,
  emissionsKg: number,
  distanceKm: number,
) => {
  if (!user) return

  try {
    const { data, error } = await supabase.from('flights').insert([
      {
        user_id: user.id,
        origin_city: originCity,
        destination_city: destCity,
        cabin_class: cabinClass,
        emissions_kg: emissionsKg,
        distance_km: distanceKm,
        created_at: new Date().toISOString(),
      },
    ]).select()

    if (error) throw error
    if (data?.[0]) {
      dispatch({
        type: 'ADD_TO_HISTORY',
        payload: data[0] as SavedFlight,
      })
    }
  } catch (err) {
    console.error('Failed to save flight to history:', err)
  }
}
```

Then update the Provider value to:

```typescript
<FlightContext.Provider value={{
  state,
  setOrigin:        (city) => dispatch({ type: 'SET_ORIGIN',        payload: city }),
  setDestination:   (city) => dispatch({ type: 'SET_DESTINATION',   payload: city }),
  setCabinClass:    (cls)  => dispatch({ type: 'SET_CABIN_CLASS',   payload: cls  }),
  reset:            ()     => dispatch({ type: 'RESET' }),
  setFlightHistory: (flights) => dispatch({ type: 'SET_FLIGHT_HISTORY', payload: flights }),
  addToHistory:     (flight) => dispatch({ type: 'ADD_TO_HISTORY', payload: flight }),
  removeFromHistory: (id) => dispatch({ type: 'REMOVE_FROM_HISTORY', payload: id }),
  clearHistory:     () => dispatch({ type: 'CLEAR_HISTORY' }),
  saveFlightToHistory,
}}>
  {children}
</FlightContext.Provider>
```

- [ ] **Step 9: Commit**

```bash
git add ecoroute/src/context/FlightContext.tsx
git commit -m "feat: extend FlightContext with flight history state and actions"
```

---

### Task 9: Create FlightHistorySidebar Components

**Files:**
- Create: `ecoroute/src/components/History/FlightHistorySidebar.tsx`
- Create: `ecoroute/src/components/History/FlightHistoryItem.tsx`

- [ ] **Step 1: Create FlightHistoryItem.tsx**

```typescript
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
```

- [ ] **Step 2: Create FlightHistorySidebar.tsx**

```typescript
// ecoroute/src/components/History/FlightHistorySidebar.tsx
import { useAuth } from '../../context/AuthContext'
import { useFlightHistory } from '../../hooks/useFlightHistory'
import { useFlightContext } from '../../context/FlightContext'
import { supabase } from '../../lib/supabase'
import FlightHistoryItem from './FlightHistoryItem'

export default function FlightHistorySidebar() {
  const { user } = useAuth()
  const { flightHistory, reloadHistory } = useFlightHistory()
  const { state, setOrigin, setDestination, setCabinClass, clearHistory } = useFlightContext()

  if (!user) return null

  const handleFlightClick = async (flight: (typeof state.flightHistory)?.[0]) => {
    if (!flight) return
    // Find cities in data to get full city data
    // For now, just set the name - coordinates will be looked up if needed
    setOrigin({ name: flight.origin_city, lat: 0, lon: 0 })
    setDestination({ name: flight.destination_city, lat: 0, lon: 0 })
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
```

- [ ] **Step 3: Commit**

```bash
git add ecoroute/src/components/History/FlightHistorySidebar.tsx ecoroute/src/components/History/FlightHistoryItem.tsx
git commit -m "feat: create FlightHistorySidebar and FlightHistoryItem components"
```

---

### Task 10: Update App.tsx to Integrate Auth

**Files:**
- Modify: `ecoroute/src/App.tsx`

- [ ] **Step 1: Read current App.tsx file**

- [ ] **Step 2: Add imports at top**

```typescript
import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import AuthButton from './components/Auth/AuthButton'
import LoginModal from './components/Auth/LoginModal'
import FlightHistorySidebar from './components/History/FlightHistorySidebar'
```

- [ ] **Step 3: Replace App component to add modal state and update header**

Replace the entire default function with:

```typescript
export default function App() {
  const [route, setRoute] = useState(() => getHashRoute(window.location.hash))
  const [loginModalOpen, setLoginModalOpen] = useState(false)

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
          <p className="mt-2 text-sm text-eco-muted">Calculate your flight emissions</p>
        </header>

        <hr className="border-eco-border" />

        <CitySelector />
        <TravelClassSelector />

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
```

- [ ] **Step 4: Commit**

```bash
git add ecoroute/src/App.tsx
git commit -m "feat: integrate AuthButton, LoginModal, and FlightHistorySidebar in App"
```

---

### Task 11: Wrap App with AuthProvider

**Files:**
- Modify: `ecoroute/src/main.tsx`

- [ ] **Step 1: Read current main.tsx file**

- [ ] **Step 2: Add AuthProvider import**

```typescript
import { AuthProvider } from './context/AuthContext'
```

- [ ] **Step 3: Wrap app with AuthProvider**

Update render to:

```typescript
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <FlightProvider>
        <App />
      </FlightProvider>
    </AuthProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 4: Commit**

```bash
git add ecoroute/src/main.tsx
git commit -m "feat: wrap app with AuthProvider"
```

---

### Task 12: Create Supabase Database Schema

**Files:**
- Execute SQL in Supabase dashboard

- [ ] **Step 1: Go to Supabase Dashboard**

Navigate to: https://app.supabase.com/project/jronzqrkrzltinoixent

Go to SQL Editor → New Query

- [ ] **Step 2: Run SQL to create flights table and RLS**

```sql
-- Create flights table
CREATE TABLE public.flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  cabin_class TEXT NOT NULL CHECK (cabin_class IN ('economy', 'business', 'first')),
  emissions_kg NUMERIC NOT NULL,
  distance_km NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX idx_flights_user_id ON public.flights(user_id);
CREATE INDEX idx_flights_created_at ON public.flights(created_at DESC);

-- Enable RLS
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own flights
CREATE POLICY "users_can_select_own_flights" ON public.flights
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own flights
CREATE POLICY "users_can_insert_own_flights" ON public.flights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own flights
CREATE POLICY "users_can_delete_own_flights" ON public.flights
  FOR DELETE
  USING (auth.uid() = user_id);
```

- [ ] **Step 3: Verify in Supabase Dashboard**

Check that `flights` table exists with all columns and RLS policies enabled.

---

### Task 13: Update EmissionsCard to Auto-Save Flights

**Files:**
- Modify: `ecoroute/src/components/Results/EmissionsCard.tsx`

- [ ] **Step 1: Read current EmissionsCard.tsx file**

- [ ] **Step 2: Add imports at top**

```typescript
import { useEffect } from 'react'
import { useFlightContext } from '../../context/FlightContext'
import { useAuth } from '../../context/AuthContext'
```

- [ ] **Step 3: Add auto-save effect inside component**

After the destructuring in the component, add:

```typescript
const { saveFlightToHistory } = useFlightContext()
const { user } = useAuth()

useEffect(() => {
  if (user && state.result && state.origin && state.destination) {
    saveFlightToHistory(
      state.origin.name,
      state.destination.name,
      state.cabinClass,
      state.result.totalEmissions,
      state.result.distance,
    ).catch((err) => {
      console.error('Failed to save flight:', err)
    })
  }
}, [state.result?.totalEmissions, user?.id, state.origin?.name, state.destination?.name, state.cabinClass, saveFlightToHistory])
```

- [ ] **Step 4: Commit**

```bash
git add ecoroute/src/components/Results/EmissionsCard.tsx
git commit -m "feat: auto-save flights to history when user is logged in"
```

---

Extracted 13 tasks from plan. Ready to begin implementation with subagent-per-task approach.
