import { useEffect, useState } from 'react'
import type { CabinClass, SavedFavorite } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface SaveFavoriteParams {
  originCity: string
  destinationCity: string
  originCountry: string
  destinationCountry: string
  cabinClass: CabinClass
  routeStrategy: string
}

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<SavedFavorite[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadFavorites = async () => {
    if (!user) {
      setFavorites([])
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFavorites(data as SavedFavorite[])
    } catch {
      setFavorites([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadFavorites()
  }, [user?.id])

  const saveFavorite = async (params: SaveFavoriteParams) => {
    if (!user) return
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        origin_city: params.originCity,
        destination_city: params.destinationCity,
        origin_country: params.originCountry,
        destination_country: params.destinationCountry,
        cabin_class: params.cabinClass,
        route_strategy: params.routeStrategy,
      })
      .select()
      .single()

    if (!error && data) {
      setFavorites((prev) => [data as SavedFavorite, ...prev])
    }
  }

  const deleteFavorite = async (id: string) => {
    await supabase.from('favorites').delete().eq('id', id)
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  return { favorites, isLoading, saveFavorite, deleteFavorite }
}
