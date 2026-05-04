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
