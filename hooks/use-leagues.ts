'use client'

import { useState, useEffect, useCallback } from 'react'
import { League } from '@/lib/types'

export function useLeagues() {
  const [leagues, setLeagues] = useState<League[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const fetchLeagues = useCallback(async () => {
    try {
      const response = await fetch('/api/leagues')
      if (response.ok) {
        const data = await response.json()
        setLeagues(data)
      }
    } catch (error) {
      console.error('Error fetching leagues:', error)
    }
  }, [])

  useEffect(() => {
    fetchLeagues()
    setIsLoaded(true)
  }, [fetchLeagues])

  const createLeague = useCallback(async (data: { name: string; countryId: string; logo?: string }) => {
    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const newLeague = await response.json()
        setLeagues(prev => [...prev, newLeague].sort((a, b) => a.name.localeCompare(b.name)))
        return newLeague
      }
    } catch (error) {
      console.error('Error creating league:', error)
    }
  }, [])

  const ensureLeague = useCallback(async (name: string, countryId: string) => {
    const existing = leagues.find(l => l.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing
    return createLeague({ name, countryId })
  }, [leagues, createLeague])

  const getLeagueId = useCallback((name: string) => {
    const trimmed = name.trim()
    const league = leagues.find((l) => l.name.toLowerCase() === trimmed.toLowerCase())
    return league?.id
  }, [leagues])

  const updateLeague = useCallback(async (id: string, updates: Partial<Pick<League, 'name' | 'logo' | 'countryId'>>) => {
    try {
      const response = await fetch('/api/leagues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      })
      if (response.ok) {
        const updated = await response.json()
        setLeagues((prev) => prev.map((l) => (l.id === id ? updated : l)))
      }
    } catch (error) {
      console.error('Error updating league:', error)
    }
  }, [])

  const removeLeague = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/leagues?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (response.ok) {
        setLeagues((prev) => prev.filter((l) => l.id !== id))
      }
    } catch (error) {
      console.error('Error deleting league:', error)
    }
  }, [])

  const deleteAllLeagues = useCallback(async () => {
    try {
      const response = await fetch('/api/leagues?all=true', { method: 'DELETE' })
      if (response.ok) {
        setLeagues([])
      }
    } catch (error) {
      console.error('Error deleting all leagues:', error)
    }
  }, [])

  return { leagues, createLeague, ensureLeague, updateLeague, removeLeague, deleteAllLeagues, getLeagueId, isLoaded, fetchLeagues }
}
