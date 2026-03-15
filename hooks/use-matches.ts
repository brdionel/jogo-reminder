'use client'

import { useState, useEffect, useCallback } from 'react'
import { Match } from '@/lib/types'

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMatches = useCallback(async (date?: string) => {
    setIsLoading(true)
    try {
      const url = date ? `/api/matches?date=${date}` : '/api/matches'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setMatches(data)
      }
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setIsLoading(false)
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const addMatch = useCallback(async (data: {
    homeTeamId: string
    awayTeamId: string
    leagueId: string
    date: string
    time: string
    venue?: string
  }) => {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const newMatch = await response.json()
        setMatches(prev => [...prev, newMatch])
        return newMatch
      }
    } catch (error) {
      console.error('Error adding match:', error)
    }
  }, [])

  const updateMatch = useCallback(async (
    id: string,
    updates: { date?: string; time?: string; venue?: string }
  ) => {
    try {
      const response = await fetch('/api/matches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      if (response.ok) {
        const updated = await response.json()
        setMatches(prev => prev.map(m => m.id === id ? updated : m))
        return updated
      }
    } catch (error) {
      console.error('Error updating match:', error)
    }
  }, [])

  const removeMatch = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/matches?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMatches(prev => prev.filter(m => m.id !== id))
      }
    } catch (error) {
      console.error('Error removing match:', error)
    }
  }, [])

  return { matches, addMatch, updateMatch, removeMatch, isLoaded, isLoading, fetchMatches }
}
