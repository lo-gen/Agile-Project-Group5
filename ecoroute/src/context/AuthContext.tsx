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
